import { Course } from '../../types/course';
import { WeekDay } from '../../types/enums';
import { randomUUID } from '../utils/idUtils';

/**
 * Demo courses based on the user's actual schedule.
 */
export function getDemoCourses(): Course[] {
  const now = new Date().toISOString();
  const colors = ['#4A90D9', '#50C878', '#E8A838', '#9B59B6', '#E74C3C', '#1ABC9C', '#F39C12', '#3498DB', '#E91E63', '#2ECC71', '#8E44AD', '#7F8C8D'];

  return [
    {
      id: randomUUID(), courseCode: '2410112', name: '大学计算机（Python）', instructor: '吴亚坤', location: '崇山 / 蕙星楼 / 400机房',
      color: colors[0], category: '公共课', courseType: '必修', credits: 2, examType: '考试',
      weekday: WeekDay.MONDAY, startTime: '10:10', endTime: '12:00', notes: '', weeks: Array.from({length:12},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '2410112', name: '大学计算机（Python）', instructor: '吴亚坤', location: '崇山 / 蕙星楼 / 400机房',
      color: colors[0], category: '公共课', courseType: '必修', credits: 2, examType: '考试',
      weekday: WeekDay.WEDNESDAY, startTime: '15:40', endTime: '17:30', notes: '', weeks: Array.from({length:12},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: 'QB0110012', name: '网络文艺鉴赏', instructor: '郑思佳', location: '崇山 / 蕙星楼 / 303',
      color: colors[1], category: '通识选修课', courseType: '任选', credits: 2, examType: '考查',
      weekday: WeekDay.FRIDAY, startTime: '18:00', endTime: '19:50', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '2310021', name: '体育（二）', instructor: '吕桐', location: '崇山 / 崇山操场 / 篮球场地2',
      color: colors[2], category: '公共课', courseType: '必修', credits: 1, examType: '',
      weekday: WeekDay.TUESDAY, startTime: '13:30', endTime: '15:20', notes: '', weeks: Array.from({length:18},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '2112022', name: '大学日语（二）', instructor: '孟辰', location: '崇山 / 蕙星楼 / 301',
      color: colors[3], category: '公共课', courseType: '必修', credits: 2, examType: '',
      weekday: WeekDay.SATURDAY, startTime: '08:00', endTime: '09:50', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '2310052', name: '军事理论', instructor: '包文峰', location: '崇山 / 东配楼 / 201',
      color: colors[4], category: '公共课', courseType: '必修', credits: 2, examType: '考试',
      weekday: WeekDay.MONDAY, startTime: '15:40', endTime: '17:30', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1021143', name: '线性代数', instructor: '陈玉艳', location: '崇山 / 东配楼 / 601',
      color: colors[5], category: '学科通选课', courseType: '必修', credits: 3, examType: '考试',
      weekday: WeekDay.THURSDAY, startTime: '08:00', endTime: '09:50', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1021143', name: '线性代数', instructor: '陈玉艳', location: '崇山 / 东配楼 / 502',
      color: colors[5], category: '学科通选课', courseType: '必修', credits: 3, examType: '考试',
      weekday: WeekDay.FRIDAY, startTime: '10:10', endTime: '12:00', notes: '', weeks: [2,4,6,8,10,12,14,16],
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1020446', name: '高等数学（下）', instructor: '张成园 孟少英', location: '崇山 / 东配楼 / 301',
      color: colors[6], category: '学科通选课', courseType: '必修', credits: 6, examType: '考试',
      weekday: WeekDay.MONDAY, startTime: '08:00', endTime: '09:50', notes: '', weeks: [1,2,3,4,6,7,8,9,10,11,12,13,14,15,16],
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1020446', name: '高等数学（下）', instructor: '张成园 孟少英', location: '崇山 / 东配楼 / 403',
      color: colors[6], category: '学科通选课', courseType: '必修', credits: 6, examType: '考试',
      weekday: WeekDay.WEDNESDAY, startTime: '13:30', endTime: '15:20', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1020446', name: '高等数学（下）', instructor: '张成园 孟少英', location: '崇山 / 东配楼 / 402',
      color: colors[6], category: '学科通选课', courseType: '必修', credits: 6, examType: '考试',
      weekday: WeekDay.THURSDAY, startTime: '13:30', endTime: '15:20', notes: '', weeks: [5],
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1020446', name: '高等数学（下）', instructor: '张成园 孟少英', location: '崇山 / 东配楼 / 602',
      color: colors[6], category: '学科通选课', courseType: '必修', credits: 6, examType: '考试',
      weekday: WeekDay.FRIDAY, startTime: '15:40', endTime: '17:30', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1010103', name: '热学', instructor: '孔令茹', location: '崇山 / 东阶梯 / 101',
      color: colors[7], category: '学科核心课', courseType: '必修', credits: 3, examType: '考试',
      weekday: WeekDay.MONDAY, startTime: '13:30', endTime: '15:20', notes: '', weeks: [2,4,6,8,10,12,14,16],
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1010103', name: '热学', instructor: '孔令茹', location: '崇山 / 蕙星楼 / 501',
      color: colors[7], category: '学科核心课', courseType: '必修', credits: 3, examType: '考试',
      weekday: WeekDay.TUESDAY, startTime: '08:00', endTime: '09:50', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1020343', name: 'C语言程序设计', instructor: '陶然 王可心', location: '崇山 / 东配楼 / 203',
      color: colors[8], category: '学科核心课', courseType: '必修', credits: 3, examType: '考试',
      weekday: WeekDay.WEDNESDAY, startTime: '08:00', endTime: '09:50', notes: '', weeks: [1,2,3,4,6,7,8,9,10,11,12,13,14,15,16],
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1020343', name: 'C语言程序设计', instructor: '陶然 王可心', location: '崇山 / 东配楼 / 303',
      color: colors[8], category: '学科核心课', courseType: '必修', credits: 3, examType: '考试',
      weekday: WeekDay.FRIDAY, startTime: '13:30', endTime: '15:20', notes: '', weeks: [2,4,6,8,10,12,14,16],
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1020073', name: '电路分析基础', instructor: '徐健博 王绩伟', location: '崇山 / 东配楼 / 101',
      color: colors[9], category: '学科核心课', courseType: '选修', credits: 3, examType: '考试',
      weekday: WeekDay.TUESDAY, startTime: '15:40', endTime: '17:30', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1030341', name: 'C语言实验', instructor: '陶然 王可心', location: '崇山 / 虚拟排课教室10-7',
      color: colors[10], category: '学科基础实验', courseType: '必修', credits: 1, examType: '考查',
      weekday: WeekDay.TUESDAY, startTime: '18:00', endTime: '19:50', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '1021651', name: '普通物理实验', instructor: '曹硕 王军平', location: '崇山 / 虚拟排课教室10-3',
      color: colors[11], category: '学科基础实验', courseType: '必修', credits: 1.5, examType: '考查',
      weekday: WeekDay.SATURDAY, startTime: '18:00', endTime: '19:50', notes: '', weeks: [1,3,5,7,9,11,13,15],
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '2210113', name: '中国近现代史纲要', instructor: '彭博', location: '崇山 / 东配楼 / 401',
      color: colors[0], category: '思政类课程', courseType: '必修', credits: 3, examType: '考试',
      weekday: WeekDay.THURSDAY, startTime: '15:40', endTime: '17:30', notes: '', weeks: Array.from({length:16},(_,i)=>i+1),
      createdAt: now, updatedAt: now,
    },
    {
      id: randomUUID(), courseCode: '2210182T02', name: '形势与政策-2', instructor: '王文平', location: '崇山 / 西阶梯 / 101',
      color: colors[1], category: '思政类课程', courseType: '必修', credits: 0.5, examType: '考查',
      weekday: WeekDay.THURSDAY, startTime: '13:30', endTime: '15:20', notes: '', weeks: [10,12,14,16],
      createdAt: now, updatedAt: now,
    },
  ];
}
