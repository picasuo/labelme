NAME=labelme
VERSION=latest


.PHONY: local
local:
	@docker build -t registry.cn-hangzhou.aliyuncs.com/sxkj/$(NAME):$(VERSION) .
	@docker push registry.cn-hangzhou.aliyuncs.com/sxkj/$(NAME):$(VERSION)
	@docker run -itd --name labelme registry.cn-hangzhou.aliyuncs.com/sxkj/$(NAME):$(VERSION)
	@docker cp labelme:/workspace/dist/test.tar.gz .
	@docker rm -f labelme

.PHONY: docker
docker:
	@docker build -t registry-vpc.cn-hangzhou.aliyuncs.com/sxkj/$(NAME):$(VERSION) .
	# @docker push registry-vpc.cn-hangzhou.aliyuncs.com/sxkj/$(NAME):$(VERSION)
	@docker run -itd --name labelme registry-vpc.cn-hangzhou.aliyuncs.com/sxkj/$(NAME):$(VERSION)
	@docker cp labelme:/workspace/dist/test.tar.gz .
	@docker rm -f labelme