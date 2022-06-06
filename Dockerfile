FROM geekduck/node-canvas:latest

WORKDIR  /workspace

ADD package.json /workspace/package.json

RUN npm --registry https://registry.npm.taobao.org install

ADD . /workspace

RUN npm run build && cd dist && tar zcvf test.tar.gz *