set -eu;
rm -rf *build*/;

echo "Building server...";
tsc || >&2 echo "FAILED";

echo "Starting server...";
nodemon build/main.js;