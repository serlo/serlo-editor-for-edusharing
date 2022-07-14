SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

export MOODLE_DOCKER_WWWROOT="$SCRIPT_DIR/../moodle"
export MOODLE_DOCKER_DB=pgsql
