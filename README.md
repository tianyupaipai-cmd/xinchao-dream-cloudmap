# Xinchao Dream Cloudmap

一个可独立使用的 360° 梦境云图。梦境按真实时间分布在三维天空里：越新的梦越近、越实；越久的梦越远、越高、越淡。拖动可以环视，滚轮可以缩放，点击云朵会触发选择事件。

清醒度只读取数据中的 `lucidity`。旧梦没有这个字段时会保留为未知，组件不会伪造数值。

## 使用

```html
<script type="module" src="./src/dream-cloudmap.js"></script>

<xinchao-dream-cloudmap id="dreams" style="display:block;height:680px"></xinchao-dream-cloudmap>

<script type="module">
  const map = document.querySelector('#dreams');
  map.dreams = await fetch('/my-private-dream-api').then(r => r.json());
  map.addEventListener('dream-select', event => {
    console.log(event.detail);
  });
</script>
```

## 数据格式

```js
{
  id: 'dream-id',
  createdAt: '2026-08-03T01:45:00.000Z',
  title: '标着 OB 的箱子',
  dream: '梦境正文（可选）',
  residue: '醒后的余韵（可选）',
  lucidity: 0.72 // 可选，0 到 1；缺失时保持未知
}
```

组件只负责显示传入的数据，不读取记忆库，也不处理鉴权。请在服务端完成所有访问控制和脱敏。

## 天空

天色跟着**读者此刻的真实时间**走，不是固定的一张渐变图：

- 太阳按钟点定方位，正午最高但不到天顶——留出方位差，转到背光那侧天会沉下来
- 昼 / 夜 / 晨昏三档天色插值
- 夜里才浮起星，白天那一层完全不可见

云的位置由梦的 `id` 生成确定性抖动：同一个梦每次都落在同一处（读者要能认出"那朵云"），但整片天不会排成队列。抖动幅度随数据量缩放，"越旧越远越高"的整体趋势不会被打乱。

## 交互

- 鼠标或手指拖动：360° 环视与上下俯仰
- 鼠标滚轮：远近缩放
- 方向键：键盘环视
- `+` / `-`：键盘缩放
- 点击云朵：触发 `dream-select`
- 调用 `resetView()`：回到初始视角

## 设计说明

时间衰减与可探索星图的交互方向参考了 `Sereo-430/memory-starmap`。本仓库的三维天堂云端视觉、Web Component 实现和源代码为独立设计，并未复制该项目代码。

## License

MIT
