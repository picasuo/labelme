FROM geekduck/node-canvas:latest

WORKDIR  /workspace

ADD package.json /workspace/package.json

RUN npm set canvas_binary_host_mirror https://registry.npmmirror.com/-/binary/canvas/
RUN npm set sass_binary_site sass_binary_site=https://registry.npmmirror.com/-/binary/node-sass
# RUN npm install canvas --canvas_binary_host_mirror=https://npm.taobao.org/mirrors/node-canvas-prebuilt/
RUN npm --registry https://registry.npm.taobao.org install

ADD . /workspace

RUN npm run build && cd dist && tar zcvf test.tar.gz *