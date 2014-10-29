#!/bin/bash
#
# description: SourceJS service, for managing production server, using node-forever.
# processname: node
#
# Based on https://gist.github.com/jinze/3748766
#
# To use it as service on Ubuntu:
# sudo cp source.sh /etc/init.d/source
# sudo chmod a+x /etc/init.d/source
# sudo update-rc.d source defaults
#
# Then use commands:
# sudo service source <command (start|stop|etc)>

NAME=SourceJS                            # Unique name for the application
USER=user                                # User for process running
HOME_DIR=/home/user                      # User home dir
SOUREC_DIR=$HOME_DIR/Source              # Location of the application source
COMMAND=node                             # Command to run
APP_PATH=$SOUREC_DIR/app.js              # Application entry point script
NODE_ENVIRONMENT=production              # Node environment

FOREVER=forever

start() {
    echo "Starting $NAME node instance : "

    sudo -H -u $USER NODE_ENV=$NODE_ENVIRONMENT $FOREVER start -a -c $COMMAND $APP_PATH

    RETVAL=$?
}

restart() {
    echo "Restarting $NAME node instance : "
    sudo -H -u $USER $FOREVER restart $APP_PATH
    RETVAL=$?
}

status() {
    echo "Status for $NAME : "
    sudo -H -u $USER $FOREVER list
    RETVAL=$?
}

stop() {
    echo "Shutting down $NAME node instance."
    sudo -H -u $USER $FOREVER stop $APP_PATH
    RETVAL=$?
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage:  {start|stop|status|restart}"
        exit 1
        ;;
esac
exit $RETVAL