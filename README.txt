npm install -g @babel/node

npm init
npm install @babel/core @babel/cli @babel/preset-env


创建.babelrc文件，内容如下：
{
    "presets":[
        "babel/preset-env"
    ]
}