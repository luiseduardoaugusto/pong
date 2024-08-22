#!/usr/bin/env bash
# exit on error
set -o errexit

bundle install
bundle exec rails assets:clobber
RAILS_ENV=production bundle exec rails assets:precompile
bundle exec rails assets:clean

# If you're using a Free instance type, you need to
# perform database migrations in the build command.
# Uncomment the following line:

bundle exec rails db:migrate

# Print out some debugging information
echo "Listing precompiled assets:"
ls -la public/assets

echo "Checking for match_controller.js:"
find public/assets -name "*match_controller*"