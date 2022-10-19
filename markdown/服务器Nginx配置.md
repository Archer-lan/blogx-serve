---
title: 服务器Nginx配置
author: Lanlan
email: lan78125@gamil.com
readmore: true
categories: Nginx学习
---

### 配置服务器`Nginx`

#### 下载`Nginx`

（1）进入官网查找需要下载版本的链接地址，使用wget命令获取

`wget ~`

（2）将下载的资源进行包管理

`mkdir -p nginx/core`

`mv nginx-1.21.6.tar.gz nginx/core`

（3）解压缩

`tar -xzf nginx-1.21.6.tar.gz`

`1.21.6`版本

安装必要的依赖包

##### 安装`gcc`编译器

`yum install -y gcc`

##### 编译器安装完成后设置配置

`./configure --prefix=/usr/local/nginx`

##### 兼容正则表达式库

`yum install -y pcre pcre-devel`

##### 压缩算法

`yum install -y zlib zlib-devel`

##### `OpenSSL`

开放源代码的软件库包，应用程序可以使用这个包进行安全通信，并且避免被窃听。

`yum install -y openssl openssl-devel`来安装

通过rpm `-qa openssl openssl-devel`来查看是否安装成功

##### 安装完毕之后执行

`make`

`make install` 

#### 启动`Nginx`

进入目录*/usr/local/nginx/sbin*

```
./nginx  启动
./nginx -s stop 快速停止
./nginx -s quit 优雅关闭，在退出前完成已经接受的连接请求
./nginx -s reload 重新加载配置
```

#### 关于防火墙

##### 关闭防火墙

`systemctl stop firewalld.service`

##### 禁止防火墙开机启动

`systemctl disable firewalld.service`

##### 放行端口

`firewall-cmd --zone=public --add-port=80/tcp --permanent`

##### 重启防火墙

`firewall-cmd --reload`

#### `conf`：nginx所有配置文件

​	CGI（Common Gateway Interface）通用网关【接口】，主要解决的问题是从客户端发送一个请求和数据，服务端获取到请求和数据后可以调用CGI【程序】处理及相应结果给客户端的一种标准规范。

/usr/local/nginx
├── client_body_temp
├── conf
│   ├── fastcgi.conf
│   ├── fastcgi.conf.default
│   ├── fastcgi_params
│   ├── fastcgi_params.default
│   ├── koi-utf
│   ├── koi-win
│   ├── mime.types
│   ├── mime.types.default
│   ├── nginx.conf
│   ├── nginx.conf.default
│   ├── scgi_params
│   ├── scgi_params.default
│   ├── uwsgi_params
│   ├── uwsgi_params.default
│   └── win-utf
├── fastcgi_temp
├── html
│   ├── 50x.html
│   └── index.html
├── logs
│   ├── access.log 访问日志
│   └── error.log 错误日志
├── proxy_temp
├── sbin
│   └── nginx 二进制可执行文件
├── scgi_temp
└── uwsgi_temp							

#### `Nginx`服务器启停命令

##### 1.`Nginx`服务的信号控制

当`Nginx`启动后，我们通过`ps -ef | grep nginx`命令可以查看到如下内容

![image-20220913193114962](C:\Users\78125\AppData\Roaming\Typora\typora-user-images\image-20220913193114962.png)

从上图中可以看到，`Nginx`后台进程中包含一个master进程和多个worker进程，master进程胡政尧用来管理worker进程，包含接收外界的信息，并将接收到的信号发送给各个worker进程，监控worker进程的状态，当worker进程出现异常退出后，会自动重新启动新的worker进程。而worker进程则是专门用来处理用户请求的，各个worker进程之间是平等的并且相互独立，处理请求的机会也是一样的。

（2）信号

| 信号     | 作用                                                       |
| -------- | ---------------------------------------------------------- |
| TERM/INT | 立即关闭整个服务                                           |
| QUIT     | 优雅地关闭整个服务                                         |
| HUP      | 重读配置文件并使用服务对新配置项生效                       |
| USR1     | 重新打开日志文件，可以用来进行日志切割                     |
| USR2     | 平滑升级到最新版的nginx                                    |
| WINCH    | 所有子进程不再接收处理新链接，相当于给work进程发送QUIT指令 |

调用命令为`kill -signal PID`

`signal`：即为信号；`PID`即为获取到的`master`线程ID

2.`Nginx`的命令行控制

![屏幕截图 2022-09-13 194916](C:\Users\78125\Pictures\Saved Pictures\屏幕截图 2022-09-13 194916.png)

`-s`后可以跟

`stop`：快速关闭

`quit`：优雅关闭

reopen：重新打开日志文件

`reload`：类似于HUP信号的作用

#### Nginx服务器版本升级和新增模块

要求升级Nginx版本时，不能终端提供服务。

有两种解决方案：

##### 1.Nginx服务信号完成Nginx的升级

第一步：对旧版本的sbin目录下的nginx进行备份

`cd /usr/local/nginx/sbin`

`mv nginx nginxold`

第二步：将Nginx新版本安装目录编译后的objs目录下的nginx文件，拷贝到原来`/usr/local/nginx/sbin`目录下

`cd ~/nginx/core/nginx版本号/objs`

`cp nginx /usr/local/nginx/sbin`

第三步：发送信号USR2给Nginx的旧版本master进程

`kill -USR2 'more /usr/local/logs/nginx.pid'`

##### 2.使用Nginx安装目录的make命令完成升级

第一步：将旧版本的sbin目录下的nginx进行备份

`cd /usr/local/nginx/sbin`

`mv nginx nginxold`

第二步：将Nginx新版本安装目录编译后的objs目录下的nginx文件，拷贝到原来`/usr/local/nginx/sbin`目录下

`cd ~/nginx/core/nginx版本号/objs`

`cp nginx /usr/local/nginx/sbin`

第三步：进入到安装目录，执行`make upgrade`

#### Nginx核心配置文件结构

Nginx的核心配置文件默认是放在`/usr/local/nginx/conf/nginx.conf`

```

worker_processes  1;

events {
    worker_connections  1024;
}

#http块，是Nginx服务器配置中的重要部分，代理、缓存、日志记录、第三方模块配置...
http {
    include       mime.types;
    default_type  application/octet-stream; 
    sendfile        on;
	keepalive_timeout  65;
	
    server { #server块，是nginx配置和虚拟主机相关的内容
        listen       80;
        server_name  localhost;

        location / {
        	#location块，基于nginx服务器接收请求字符串与location后面的值进行匹配，对特定请求进行处理。
            root   html;
            index  index.html index.htm;
        }
        error_page 500 502 503 /50x.html
        location =/50x.html{
        	root html;
        }
}
```





