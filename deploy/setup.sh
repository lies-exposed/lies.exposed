#!/usr/bin/env bash

set -e -x

export SSH_DOMAIN=alpha.api.lies.exposed
scp .env.alpha $SSH_DOMAIN:.env
scp -r ./deploy/nginx $SSH_DOMAIN:/root/nginx

ssh $SSH_DOMAIN << "EOF"
    set -x -e
    DOMAIN=alpha.api.lies.exposed
    curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt update
    sudo apt install yarn nodejs -y
    cat ~/nginx/api.http.conf
    cp -f ~/nginx/api.http.conf /etc/nginx/sites-available/$DOMAIN
    cat /etc/nginx/sites-available/$DOMAIN
    ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
    cat /etc/nginx/sites-enabled/$DOMAIN
    mkdir -p /var/www/letsencrypt
    sudo nginx -t
    sudo systemctl reload nginx
    # node -v
    # cd ~/node/app/current
    # yarn set version latest
    # yarn
    # sudo certbot --nginx -d $DOMAIN
    cat /etc/nginx/sites-enabled/$DOMAIN
EOF

