# TODOs on large scale

1. 全部的业务对象定义 / model
2. 地图的框选和多选（配合热键）管理（处理）（90%）
3. 图块控制

- Rotate
- Resize
- ...

4. 地图模式管理（基本解决，90%）
5. 现有的 Collection 对象是否有价值？（无)
6. 作为 npm 包发布（100%）
7. 组合图形（用处不大）
8. 输送线使用 Canvas 绘制会达到更好的效果
9. 进一步分离接口（兼容 leaflet 和 threejs）
10. 基本的 React 容器组件 ✅
11. 用户自定义图形类型和元素管理 ✅
12. 多库区的实现 ✅
13. svg overlay 的 contextmenu 功能（60%）
14. 性能：动画会导致内存占用严重，是因为 next 链条太长？
15. 对 meta 图形定义方案进行讨论，取舍？
16. haiPort 绘制，要使用 meta 定义
17. 缓存货架绘制，要使用 meta 定义
18. 基于 canvas 原生 api 绘制货架，要使用 meta 定义
19. 边的绘制，包含 bezier 曲线、直线、方向
20. 机器人行进路径的绘制，基于点的链接，包含 bezier 曲线、直线和方向
21. 对元素的状态的 redo 和 undo（应用级别的 redo/undo）
22. 快捷键逻辑
23. 消息与动画的协调逻辑

# Next TODOs

1. Group

- 仿照 ThreeJS 的设置，从 Layer 继承 ✅
- 子元素均设置相对位置和角度
- 需要对子元素的交互行为/事件需要作联动处理，即 A，B 都是属于 G，那个 Hover A，同时也会 Hover B✅
- 选中（只能选中 Group， 而不能选中其下子元素，但是子元素需要执行样式变化）
  - 对 select layer 加工？

2. 提供一个基本 Warehouse，不包含 ESS 相关业务 ✅
3. 提供一个 EssWarehouse extends Warehouse ✅
4. 支持选择若干元素，创建一个组
5. 支持将一个组解散
6. Interactive.onDrag... 由 behavior 下的 onPress 衍生出来 ✅
7. LayerList 下的 onItemXXX 应该合并为一个函数逻辑 ✅
8. 思考：是否需要将 Group 放到一个 List 进行管理？
9. 组的框选选中
10. Group, 是在 add 的时候才创建 pane 和 renderer，需要支持 add 之前可添加 child ✅
11. 搞一个类似 LayerGroup 的一个 Group
12. 元素拖动性能问题方案：使用 svg renderer
13. model 需要 Group？
14. Scene 组件支持 view 的字符串格式 ✅
15. 撤销/恢复 ✅
16. tsc ✅
17. ViewSet 支持传入 viewset 实例 ✅
18. 支持多级元素上下文菜单
19. 复合元素的 model-view 映射
20. 地图的旋转
21. build：生成一个 umd 包 + 一个声明文件？ ✅
22. Group 类可组件化
23. Group 需要受 Warehouse 管理
24. ViewSet 支持声明 model-view-mapping 函数 ❌ (不做了)
25. 继承 EventEmitter3 之后类型貌似变弱了 ✅ - 重命名
26. 属性注入支持服务容器创建 😂
27. 对“组”进行重新构思
28. 修改 layer list 的事件类型的名称，保留原始名称就行，不要重新定义 ✅
29. snapshot mix ✅
30. 插入一些 demo 的截图，或者部署一个 playground
31. clickCancel Mixin 需要应用到 reactive layer 上 😭
32. \_\_on\_\_ 等函数移到 EmiterMix 上 ✅
33. OT 不应出现了 2d/Warehouse 这个类上 ✅
34. List 进一步抽象，希望 LayerList 和 Object3dList 可以继承之 ✅
35. 将 eventemitter 全部替换为 core ✅
36. 考虑一下 group 和 list 之间的重合和差异
37. selectionManager 和 modeManager 甚至 HighlightManager 可以放到 model/state 目录下
38. warehouse.tsx 下的 相关代码可以移到 warehouse 类中 ✅
39. 鼠标事件存在次序问题

## TODO - 3d

1. onclick, on noopclick, onhover,

## 文档 ✅

- 使用 hexo 生成 readme，guide
- 使用 typedoc 生成 api
- 合成二者

## 单元测试
