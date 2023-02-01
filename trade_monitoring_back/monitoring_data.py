import threading
import copy
from time import sleep
import logging
from datetime import datetime
import json
from threading import Lock


class MonitoringData:
    """
    The object for preprocessing minitoring data file.
    """
    logger = logging.getLogger('Monitoring')

    path = 'data/load/Load.csv'

    def __init__(self) -> None:
        # first line (datetime) from last file
        self.last_time = None
        # DB format
        self.db = {}
        self.lock = Lock()
        self.theread = threading.Thread(target=self._threaded_loop, args=())

    def _clear_db(self) -> None:
        """Clear the DB"""
        self.db = {
            'on': False,
            'date': '',
            'time': '',
            'rigs': []
        }

    def _threaded_loop(self) -> None:
        while True:
            now = datetime.now()
            if now.second == 30:
                self._read_file()
                sleep(2)
            sleep(0.5)

    def get_json(self) -> str:
        self.lock.acquire()
        answer = copy.deepcopy(self.db)
        self.lock.release()
        return json.dumps(answer, indent=0)

    def _read_file(self) -> None:
        """
        Read the file. File format:
            2023.01.27 09:17
            1 16 14 0
            2 16 1 0
            3 16 4 0
            ...
            ...
        """
        self.lock.acquire()
        self._clear_db()
        try:
            self.logger.debug(f'Try to read file {self.path}')
            with open(self.path) as file:
                lines = file.readlines()
        except Exception as e:
            self.logger.error(e)
            self.lock.release()
            return

        for i, line in enumerate(lines):
            lines[i] = line.replace('\r', '').replace('\n', '')

        try:
            date, time = lines.pop(0).split(' ')
            self.db['date'] = date
            self.db['time'] = time
            last_time = datetime.strptime(date+' '+time, "%Y.%m.%d %H:%M")
            if self.last_time and abs(self.last_time.minute - last_time.minute) <= 5:
                self.db['on'] = True
            self.last_time = last_time
        except Exception as e:
            self.logger.error("Error date format in first line!")
            self._clear_db()
            self.lock.release()
            return

        for rig in lines:
            try:
                lrig = rig.split(' ')
                _id = lrig.pop(0)
                minute, load, tsunami, name = None, '0', '0', ''
                try:
                    minute, load, tsunami, name = lrig
                except:
                    pass
                on = False
                try:
                    if abs(self.last_time.minute - int(minute)) <= 5:
                        on = True
                except:
                    pass
                self.db['rigs'].append({
                    'id': int(_id),
                    'on': on,
                    'load': 0 if load == '' else int(load),
                    'tsunami': False if tsunami == '' else bool(int(tsunami)),
                    'name': name,
                })
            except:
                self.logger.error(f'Error read line: {rig}')
                self._clear_db()
                self.lock.release()
                return
        self.lock.release()
        self.logger.debug(f'end read file')


    def run(self) -> None:
        self.theread.start()
