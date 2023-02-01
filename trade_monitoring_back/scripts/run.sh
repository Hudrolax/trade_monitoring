#!/bin/sh

uwsgi --socket :9000 --protocol=http --enable-threads -w wsgi:app
