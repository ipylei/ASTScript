入门指引：https://wx.zsxq.com/dweb2/index/topic_detail/841125151558112
    爬虫Chrome插件：https://mp.weixin.qq.com/s?__biz=MzAwNTY1OTg0MQ==&mid=2647563166&idx=1&sn=6330407705c77366581d74be50a3088c&chksm=83237630b454ff2697105b3a3418c8aebb525b200d461a6db8a43e87dabfd4ab601758d83fd3&scene=21#wechat_redirect
    浏览器执行AST插件：https://mp.weixin.qq.com/s/5WcUWSkDEXQj6ctwINNdfw
    
插件索引：https://wx.zsxq.com/dweb2/index/topic_detail/182285454825852
实战文章：https://wx.zsxq.com/dweb2/index/topic_detail/215518282185851

【TODO】
【*】AST反混淆实战索引：https://wx.zsxq.com/dweb2/index/topic_detail/211424884545281
ob混淆专题：https://wx.zsxq.com/dweb2/index/tags/ob%E6%B7%B7%E6%B7%86%E4%B8%93%E9%A2%98/51118515554244
优秀项目：https://wx.zsxq.com/dweb2/index/tags/%E4%BC%98%E7%A7%80%E9%A1%B9%E7%9B%AE/48848428411258



前置文章：
    【*】AST实战|如何用浏览器执行你写的AST插件? https://mp.weixin.qq.com/s/5WcUWSkDEXQj6ctwINNdfw
    【*】[AST实战|快使用 template 来构建简单的节点]：https://articles.zsxq.com/id_k11ol71z23bw.html

    AST插件类编写小技巧：https://mp.weixin.qq.com/s/31pFqbLEUnYOxzXRJApFvQ
    AST实战|遇到混淆的代码怎么下手(初级混淆): https://mp.weixin.qq.com/s/rQ_UWdeMWNwAE8P5U_gm5g
    新手必看|babel库插件编写方式答疑：https://mp.weixin.qq.com/s/PNw_4q3d0vD6Qm3NHaCgeg
    [工具推荐|一款爬虫界的神兵利器，值得拥有]：https://mp.weixin.qq.com/s?__biz=MzAwNTY1OTg0MQ==&mid=2647563166&idx=1&sn=6330407705c77366581d74be50a3088c&chksm=83237630b454ff2697105b3a3418c8aebb525b200d461a6db8a43e87dabfd4ab601758d83fd3&scene=21#wechat_redirect


有混淆JS的海外网站：https://t.zsxq.com/16cuXpbcI
毛子写的阿卡迈文章：https://github.com/rastvl/akamai-deobfuscator-2.0









不太常用的插件：
    13.合并变量的声明与定义 
        https://wx.zsxq.com/dweb2/index/topic_detail/814458844281122  (缺点：这里的声明与定义必须是紧挨着)

    14.VariableDeclaration 节点内部的还原处理。
        https://wx.zsxq.com/dweb2/index/topic_detail/412248822144118  (可以使用变量引用还原代替)           
    
    23.万能数组还原 
        https://wx.zsxq.com/dweb2/index/topic_detail/184211511258112  (缺点：这个数组不能有改变, 如:a = [1, 2, 3]; a[2]=3)

    24.部分常量运算合并 (部分常量折叠)
        https://wx.zsxq.com/dweb2/index/topic_detail/415442454152148 (感觉用处不大)

    24.if语句下沉
        https://wx.zsxq.com/dweb2/index/topic_detail/184288155855112 (感觉用处不大)
    
    27.switch只有一个case时还原
        https://wx.zsxq.com/dweb2/index/topic_detail/581545425848114
        
    30.处理Try...catch语句，默认替换为block子节点里面的内容
        https://wx.zsxq.com/dweb2/index/topic_detail/184585125285522
    