import threading
import copy
from time import sleep
import logging
import json
from threading import Lock
import pandas as pd
from os.path import getctime


class PerformanceMonitoring:
    """
    The object for preprocessing performance monitoring data file.
    """
    logger = logging.getLogger('Performance monitoring')

    path = 'data/performance/Performance-P100.txt'

    def __init__(self) -> None:
        self.db = {}
        self.file_timestamp = 0
        self.lock = Lock()
        self.theread = threading.Thread(target=self._threaded_loop, args=())

    def _threaded_loop(self) -> None:
        while True:
            self._read_file()
            sleep(5)

    def _clear_db(self):
        self.db = {
                'optimalPNL': 0,
                'optimalRisk': 0,
                'data': [],
                }

    def get_json(self) -> str:
        self.lock.acquire()
        answer = copy.deepcopy(self.db)
        self.lock.release()
        return json.dumps(answer, indent=0)

    def _read_file(self) -> None:
        """
        Read the file. File format:
            Date;PNL;Risk;Equity;Trades;Note
            ;2.22;1.45;;;			
            10.2022;7.48;0.1;$10,802,599;4,183;
            11.2022;2.08;1.01;$11,027,490;3,882;TS was moved to another broker
            12.2022;2.88;0.7;$11,344,537;5,988;	
            1.2023;-2.1;4.84;$11,106,341;5,256;	
            ...
            ...
        """
        try:
            file_ts = getctime(self.path)
            if self.file_timestamp == file_ts:
                return
            self.file_timestamp = file_ts
        except Exception as ex:
            self.logger.warning(ex)
            sleep(3)
            return

        self.lock.acquire()
        self._clear_db()
        try:
            self.logger.debug(f'Try to read file {self.path}')
            df = pd.read_csv(self.path, sep=';')
            df['Note'] = df['Note'].fillna('')
            df['Note'] = df['Note'].apply(lambda x: x.replace('\t', ''))
            self.db['optimalPNL'] = df.loc[0, 'PNL']
            self.db['optimalRisk'] = df.loc[0, 'Risk']

            for i in range(1, len(df)-1):
                _str = df.loc[i]
                self.db['data'].append({
                    'date': _str['Date'],
                    'PNL': _str['PNL'],
                    'Risk': _str['Risk'],
                    'Equity': _str['Equity'],
                    'Trades':  _str['Trades'],
                    'Note': _str['Note']
                    })

        except Exception as e:
            self.logger.error(f'Error load {self.path}')
            self.logger.error(e)
            self.lock.release()
            return

        self.lock.release()
        self.logger.debug(f'end read file')


    def run(self) -> None:
        self.theread.start()
