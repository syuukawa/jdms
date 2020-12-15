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

### 注意事项

* 由于众所周知的网络问题，研发环境启动时可能因为下载`electron-devtools`失败而报`Failed to fetch extension, trying 4 more times`，但是不会影响使用
* 同样的，第一次打包因为有依赖`winCodeSign-2.6.0.7z`这个包，下载失败也会导致打包失败，可以自己找一下资源下载完成后放到`dist_electron`这个目录下面
* 目前还处于实验阶段，可能存在BUG及众多不稳定因素。由于还是个社畜，可能不能及时更新。

如果没有node环境可以启动，可直接下载[可安装软件](https://github.com/Yx1aoq1/jdms/releases/tag/0.1.0)

electron打包配置还在学习中，所以目前**只支持window版本的安装**

### 软件截图

![jdms](https://github.com/Yx1aoq1/jdms/blob/master/jdms.gif)

### TODO

* 可能把烦人的message提示改成后台日志
* 增加查询商品库存，有库存自动下单的功能

### 声明

* 项目主要是基于学习electron的目的创建的，禁止任何的商用
* 由于贫穷没有mac，所以mac版本如果有问题也无法处理，见谅
