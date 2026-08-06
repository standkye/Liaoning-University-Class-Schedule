# 辽宁大学课程表

辽宁大学课程表 App，支持从教务系统导入课程、课表可视化、上课提醒等功能。

## 功能

- **课表展示** — 7 天课程表，按周切换，支持左右滑动
- **教务系统导入** — 粘贴选课结果文本，一键导入课程
- **课程管理** — 按课程查看所有时段、编辑、添加、删除
- **今日日程** — 当天课程一览，分上午/下午/晚上
- **上课提醒** — 课前 30 分钟通知栏提醒（需授权）
- **数据导出** — 导出课表为 JSON 或图片
- **多主题** — 4 套暗色主题可选

## 技术栈

- Expo SDK 56
- React Native 0.85
- TypeScript
- Zustand 状态管理
- React Navigation 导航
- React Native Reanimated 动画
- Expo Notifications 通知

## 运行

```bash
npm install
npx expo start
```

## 构建

```bash
npx eas build --platform android --profile preview
```

## 下载

[最新 APK](https://expo.dev/artifacts/eas/dR5gorMnPkhRtKswMexSWB.apk)

## License

MIT
