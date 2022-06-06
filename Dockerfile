FROM node:14-buster

RUN sed -i 's#http://deb.debian.org#http://mirrors.aliyun.com#g' /etc/apt/sources.list
RUN sed -i 's#http://security.debian.org#http://mirrors.aliyun.com#g' /etc/apt/sources.list

RUN apt update
RUN apt-get update \
    && apt-get install -qq build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

RUN npm set canvas_binary_host_mirror https://registry.npmmirror.com/-/binary/canvas/

RUN mkdir -p /opt/node/js \
    && cd /opt/node \
    && npm i canvas


WORKDIR  /workspace

ADD package.json /workspace/package.json

RUN npm set sass_binary_site sass_binary_site=https://registry.npmmirror.com/-/binary/node-sass
# RUN npm install canvas --canvas_binary_host_mirror=https://npm.taobao.org/mirrors/node-canvas-prebuilt/
RUN npm --registry https://registry.npm.taobao.org install

ADD . /workspace

RUN npm run build && cd dist && tar zcvf test.tar.gz *