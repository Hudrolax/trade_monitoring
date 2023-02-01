import threading
import copy
from time import sleep
import logging
from datetime import datetime
import json
from threading import Lock
import os
import pandas as pd
import numpy as np


class PortfolioEquity:
    """
    The object for preprocessing quity data files.
    """
    logger = logging.getLogger('Equity preprocessing')

    path = 'data/equity/'

    def __init__(self) -> None:
        self.db = {}
        self.lock = Lock()
        self.theread = threading.Thread(target=self._threaded_loop, args=())

    def _clear_db(self) -> None:
        """Clear the DB"""
        self.db = {'rigs': []}

    def _threaded_loop(self) -> None:
        while True:
            self._read_file()
            sleep(60)

    def get_json(self) -> str:
        self.lock.acquire()
        answer = copy.deepcopy(self.db)
        self.lock.release()
        return json.dumps(answer, indent=0)

    def _read_file(self) -> None:
        self.logger.debug(f'Start reading the directory {self.path}')
        self.lock.acquire()
        self._clear_db()
        files_list = []

        try:
            for root, dirs, files in os.walk(self.path):
                files_list = files
                break
        except:
            self.logger.error(f'Error read filelist from {self.path}')
            self._clear_db()
            return

        if len(files_list) == 0:
            self.logger.error(f'Directory {self.path} is empty!')
            self._clear_db()
            return

        try:
            for file in files_list:
                df = pd.read_csv(self.path + file,
                                 header=None,
                                 names=['date', 'equity'])
                df['date'] = pd.to_datetime(df['date'],
                                            format='%d/%m/%y %H:%M')
                df['date_str'] = df['date'].dt.strftime('%m.%d.%y')
                df['date_hover'] = df['date'].dt.strftime('%d.%m.%y')
                max = 0
                maxdd = 0
                for i in range(0, len(df) - 1):
                    if df.loc[i, 'equity'] > max:
                        max = df.loc[i, 'equity']
                    if max - df.loc[i, 'equity'] > 0:
                        _dd = 100 - df.loc[i, 'equity'] * 100 / max
                        if _dd > maxdd:
                            maxdd = _dd

                months = (df.loc[len(df) - 1, 'date'] -
                          df.loc[0, 'date']) / np.timedelta64(1, 'M')
                teg = round(
                    df.loc[len(df) - 1, 'equity'] - df.loc[0, 'equity'], 2)
                averagePNLmonthly = round(teg / months, 2)
                averagePNLannual = averagePNLmonthly * 12
                _rig = {
                    'name': file.replace('.csv', ''),
                    'maxdd': round(maxdd, 2),
                    'teg': teg,
                    'averagePNLmonthly': averagePNLmonthly,
                    'averagePNLannual': averagePNLannual,
                    'data': df.drop(['date'], axis=1).to_dict(orient='list'),
                }
                self.db['rigs'].append(_rig)
        except Exception as ex:
            self.logger.error(ex)
            self._clear_db()
            return

        self.lock.release()
        self.logger.debug(f'End reading the directory {self.path}')

    def run(self) -> None:
        self.theread.start()


if __name__ == "__main__":
    a = PortfolioEquity()
    a.run()
