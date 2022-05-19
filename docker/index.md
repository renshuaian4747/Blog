# arm 架构，构建 X86 镜像
```bash
$ docker buildx build --no-cache -t $REPO:$TAG -f docker/Dockerfile --platform=linux/amd64 .
```