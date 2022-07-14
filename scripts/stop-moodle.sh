#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

. $SCRIPT_DIR/setup-moodle-env.sh
$SCRIPT_DIR/../moodle-docker/bin/moodle-docker-compose stop
