from flask import Flask
from monitoring_data import MonitoringData
from portfolio_equity import PortfolioEquity
from performance_monitoring import PerformanceMonitoring
import logging
import os
from datetime import datetime

LOG_FORMAT = '%(name)s (%(levelname)s) %(asctime)s: %(message)s'
date_format = '%d.%m.%y %H:%M:%S'

LOG_LEVEL = os.environ.get('LOG_LEVEL')
WRITE_LOG_TO_FILE = int(os.environ.get('WRITE_LOG_TO_FILE'))

LOG_LEVEL_WORK = logging.INFO
if str(LOG_LEVEL).upper() == 'INFO':
    LOG_LEVEL_WORK = logging.INFO
elif str(LOG_LEVEL).upper() == 'DEBUG':
    LOG_LEVEL_WORK = logging.DEBUG
elif str(LOG_LEVEL).upper() == 'ERROR':
    LOG_LEVEL_WORK = logging.ERROR
elif str(LOG_LEVEL).upper() == 'CRITICAL':
    LOG_LEVEL_WORK = logging.CRITICAL
logger = logging.getLogger('main')

if WRITE_LOG_TO_FILE:
    file_log = logging.FileHandler(f'log/log_{datetime.now().strftime("%m%d%Y%H%M%S")}.txt', mode='a')
    console_out = logging.StreamHandler()
    logging.basicConfig(handlers=(file_log, console_out), format=LOG_FORMAT, level=LOG_LEVEL_WORK,
                        datefmt=date_format)
else:
    logging.basicConfig(format=LOG_FORMAT, level=LOG_LEVEL, datefmt='%d/%m/%y %H:%M:%S')

app = Flask(__name__)
monitoring = MonitoringData()
monitoring.run()
equity = PortfolioEquity()
equity.run()
performance_monitoring = PerformanceMonitoring()
performance_monitoring.run()


@app.route("/monitoring")
def monitoring_route() -> str:
    return monitoring.get_json()

@app.route("/equity")
def equity_route() -> str:
    return equity.get_json()

@app.route("/performance")
def performance_route() -> str:
    return performance_monitoring.get_json()


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
