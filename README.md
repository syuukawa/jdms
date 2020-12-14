## 京东抢购秒杀助手

主要参考了[liuxingguo](https://github.com/liuxingguo)/[mjd](https://github.com/liuxingguo/mjd)这个项目的方法，由于原来的项目用的electron的版本比较低，所以更新了版本，用的`vue-cli-electron-builder`构建，顺便优化了一下交互。

京东的抢购有很多种不同的交互方式所以无法保证百分百成功。

### 使用方法

```yaml
# install dependencies 安装依赖
yarn install

# start dev server 研发环境启动
yarn run electron:serve

# build pack 打包
yarn run electron:build
```

![](https://github.com/Yx1aoq1/jdms/blob/master/jdms.gif)

### 声明
* 项目主要是基于学习electron的目的创建的，禁止任何的商用
