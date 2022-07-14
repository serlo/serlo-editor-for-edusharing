SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

. $SCRIPT_DIR/setup-moodle-env.sh
cp $SCRIPT_DIR/../moodle-docker/config.docker-template.php $MOODLE_DOCKER_WWWROOT/config.php

$SCRIPT_DIR/../moodle-docker/bin/moodle-docker-compose up -d
$SCRIPT_DIR/../moodle-docker/bin/moodle-docker-wait-for-app
$SCRIPT_DIR/../moodle-docker/bin/moodle-docker-compose exec webserver php admin/cli/install_database.php --agree-license --fullname="Docker moodle" --shortname="docker_moodle" --summary="Docker moodle site" --adminpass="test" --adminemail="admin@example.com"

echo "Moodle is now running on http://localhost:8000"
echo ""
echo "Username: admin"
echo "Password: test"
