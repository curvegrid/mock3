#!/bin/bash

ps aux | grep ganache-cli | grep -v grep | awk '{print $2}' | xargs kill -9
