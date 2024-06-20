#!/usr/bin/env bash

set -e -x

export SSH_DOMAIN=alpha.api.lies.exposed
scp ./services/api/.env.alpha $SSH_DOMAIN:.env
scp -r ./deploy/nginx $SSH_DOMAIN:/root/

ssh $SSH_DOMAIN << "EOF"
    set -x -e
    API_DOMAIN=alpha.api.lies.exposed
    WEB_DOMAIN=alpha.lies.exposed
    # curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
    # sudo apt update
    # cp -f ~/nginx/alpha.api.lies.exposed.conf /etc/nginx/sites-available/$API_DOMAIN
    cp -f ~/nginx/alpha.lies.exposed.conf /etc/nginx/sites-available/$WEB_DOMAIN
    # ln -s /etc/nginx/sites-available/$API_DOMAIN /etc/nginx/sites-enabled/$API_DOMAIN
    ln -s /etc/nginx/sites-available/$WEB_DOMAIN /etc/nginx/sites-enabled/$WEB_DOMAIN
    mkdir -p /var/www/letsencrypt
    sudo nginx -t
    sudo systemctl reload nginx
    # node -v
    # cd ~/node/app/current
    # sudo certbot --nginx -d $API_DOMAIN
    # sudo certbot --nginx -d $WEB_DOMAIN
    cat /etc/nginx/sites-enabled/$WEB_DOMAIN

EOF

