// สร้างไฟล์ Excel Test Case สำหรับทดสอบ Manual (UAT e2e): 3 ชีท — (1) Assign 1 คน (2) VGI Assign 2 คน (3) Media Management สร้าง Ticket เอง
// รัน: node scripts/build-e2e-manual-testcases.js   → reports/E2E-Manual-Test-Cases.xlsx
const ExcelJS = require('exceljs');
const path = require('path');

const COLS = ['Scenario', 'Test ID', 'Role', 'Test Case Description', 'Test Step', 'Test Data', 'Expected Result', 'Actual Result', 'Status'];

// ---------------- Scenario 1: Assign 1 คน (e2e 01-01) ----------------
const S1 = 'Assign Ticket ให้ CG 1 คน (และ Reassign) จนสถานะ Done';
const D1 = 'Media Group: Retail\nMedia Category: DIGITAL\nMedia Type (Epicor/SF): QATEST\nSale Package: 7-Eleven Plus (QATEST)';
const s1 = [
  // [testId, role, description, step, data, expected]
  ['S1-01', 'Sale', 'Sale สร้าง Ticket ใหม่แบบไม่มี Quotation', '1. เมนู MEDIA APPROVAL > Media Ticket > กด Create Ticket', '-', 'เปิดหน้า Create Ticket มี 3 ส่วน: Ticket source / Ticket information / Jobs'],
  ['S1-01', 'Sale', '', '2. ในส่วน Ticket source เลือก "No Quotation Number"', '-', 'ขึ้นข้อความ "Manual entry mode" และมีฟอร์มกรอกข้อมูล Ticket'],
  ['S1-01', 'Sale', '', '3. กรอก Client, Product และ Contract Start - End', 'Client: QA Test Client <เลขอะไรก็ได้ที่ไม่ซ้ำ>\nProduct: QA Assign Product\nContract: วันที่ 1 – 28 ของเดือนปัจจุบัน', 'Contract Period คำนวณอัตโนมัติ'],
  ['S1-01', 'Sale', '', '4. เลือก Media Group → Media Category → Media Type (Epicor/SF)', D1.split('\n').slice(0, 3).join('\n'), 'เลือกได้ตามลำดับ แต่ละช่องแสดงตัวเลือกตามช่องก่อนหน้า'],
  ['S1-01', 'Sale', '', '5. กด Add Job เลือก Sale Package แล้วกรอก Duration, Period, Material link, Brief link', 'Sale Package: 7-Eleven Plus (QATEST)\nDuration: 0 min 15 sec\nPeriod: วันที่ 1 – 21 ของเดือนปัจจุบัน\nMaterial / Brief: https://example.com/material.jpg , https://example.com/brief.pdf', 'มี Job 1 รายการ ใน Ticket summary แสดงครบ (4/4 ready)'],
  ['S1-01', 'Sale', '', '6. กด Submit ticket แล้วกด Confirm', '-', 'ขึ้น "Ticket submitted successfully" กด OK แล้วกลับหน้า Media Ticket เห็น Ticket ใหม่'],

  ['S1-02', 'Head CG', 'Head CG Assign งานให้ CG 1 คน', '1. เมนู MEDIA APPROVAL > Assign Ticket ค้นหาด้วยชื่อ Client', 'Client: QA Test Client … ที่สร้างในขั้นก่อน', 'พบ Job สถานะ "Assign" ช่อง Assigned แสดง "unassigned"'],
  ['S1-02', 'Head CG', '', '2. กดไอคอน Assign ของ Job นั้น', '-', 'เปิด dialog "Assign Graphic Designer" แสดงข้อมูล Job (Ticket, Sale Package, Media) ตรงกับแถว มีรายชื่อ designer และปุ่ม Assign กดไม่ได้ ("No Graphic selected yet")'],
  ['S1-02', 'Head CG', '', '3. เลือก CG - QA 1 คน', 'Designer: CG - QA', 'แสดง "Selected: CG - QA" และปุ่ม Assign กดได้ รายชื่อ designer มีเฉพาะตัว Head CG และ CG ในทีม'],
  ['S1-02', 'Head CG', '', '4. กด Assign (ถ้ามี modal กด OK)', '-', 'Job เปลี่ยนสถานะเป็น "Verify" ช่อง Assigned แสดง "CG - QA" และปุ่มในแถวเป็น Reassign'],

  ['S1-03', 'Head CG', 'ดูรายละเอียดและ History ของ Job', '1. กดไอคอน View details ของ Job', '-', 'เปิดหน้า Job detail ข้อมูล Client / Product / Sale Package / Sales Person ตรงกับตาราง มีปุ่ม Reassign และ History'],
  ['S1-03', 'Head CG', '', '2. กดปุ่ม History', '-', 'เปิด "Activity History" แสดงรายการ: Ticket (สร้าง Ticket) และ Assign (มอบหมายให้ CG - QA) พร้อมเวลาและผู้ทำ'],

  ['S1-04', 'Head CG', 'Head CG Reassign ให้ CG คนอื่น', '1. ที่หน้า Assign Ticket กดไอคอน Reassign ของ Job', '-', 'เปิด dialog "Reassign Graphic Designer" มี "Currently Assigned To" แสดง CG - QA'],
  ['S1-04', 'Head CG', '', '2. เลือก CG - QA 2 แล้วกด Reassign (ถ้ามี modal กด OK)', 'Designer: CG - QA 2', 'ช่อง Assigned เปลี่ยนเป็น "CG - QA 2" สถานะยังเป็น Verify'],
  ['S1-04', 'Head CG', '', '3. เปิด History ของ Job อีกครั้ง', '-', 'มีรายการ Assign เพิ่มสำหรับการเปลี่ยนผู้รับงาน (CG - QA 2 เป็นผู้ทำงานต่อจนจบในขั้นถัดไป)'],

  ['S1-05', 'CG 2 (CG - QA 2)', 'CG ผู้รับงานรับงานและส่ง Prove', '1. เมนู MEDIA APPROVAL > Verify & Production ค้นหาเลข Ticket เปิด Job เลือก Work Type แล้วกด Accept และ Confirm', 'Work Type: Mockup (Sales Pitch)', 'Job เปลี่ยนเป็น "On Process" ขึ้นการ์ด Submit Prove'],
  ['S1-05', 'CG 2 (CG - QA 2)', '', '2. ใส่ URL LINK แล้วกด Submit Prove และ Confirm', 'URL: https://example.com/qa-prove.jpg', 'ขึ้น "Prove submitted successfully" Job เป็น "Review" คอลัมน์ Prove = 1'],

  ['S1-06', 'Sale', 'Sale ตั้ง Airtime และ Approve ทุก Format', '1. เปิด Media Ticket > Ticket > Airtime Allocate เลือก Duration, ใส่ Number Spot/Loop และวันออกอากาศ แล้วกด Save Allocations', ['Duration: 7.5', 'Number Spot/Loop: 2', 'On-Air: วันที่ 1 – 20 ของเดือนปัจจุบัน'].join('\n'), 'ขึ้น "Saved successfully"'],
  ['S1-06', 'Sale', '', '2. กลับหน้า Ticket กดปุ่ม Review ของ Job เลือก "Apply to all pending" แล้ว Approve (Final approval)', '-', 'ทุก Format เป็น Approve'],
  ['S1-06', 'Sale', '', '3. แนบไฟล์หลักฐานการอนุมัติ (Ticket ไม่มี Quotation) แล้วกด Submit Review และ Submit', 'ไฟล์: approval-evidence.pdf (PDF ใดก็ได้)', 'ขึ้น "Review Submitted" Job เป็น "Final Approve" (Customer Approved, Landlord Pending)'],

  ['S1-07', 'Media Management', 'Landlord Approve', '1. เมนู Media Management เปิด Job ของ Ticket นั้น กดปุ่ม Approve แล้วกด Confirm', '-', 'ขึ้น "Approval Complete — CU+LL approval complete → Final Render" Job เป็น "Final Render"'],

  ['S1-08', 'CG 2 (CG - QA 2)', 'CG Render ไฟล์ — Job เป็น Done (จบ flow)', '1. เปิด Job ที่ Verify & Production กรอก File Name แล้วกด Render File', 'File Name: qa_render_test', 'แสดงตัวอย่างชื่อไฟล์ของทุก Format (yyyymmdd…_qa_render_test_<Format>) ยังไม่บันทึก'],
  ['S1-08', 'CG 2 (CG - QA 2)', '', '2. กด Confirm File Name Render', '-', 'Job เป็น "Done" มีข้อความ "This job is closed — no further edits are allowed" และ "Rendered Files (n formats) Confirmed"'],
  ['S1-08', 'Head CG / Sale / CG 2', '', '3. เปิดดูสถานะ Job จากหน้า Assign Ticket (Head CG), Media Ticket (Sale) และ Verify & Production (CG - QA 2)', '-', 'ทุกหน้าแสดงสถานะ "Done" ตรงกัน'],
];

// ---------------- Scenario 2: VGI Assign 2 คน (e2e multi-assignee) ----------------
const S2 = 'VGI (BTS) Assign ให้ CG 2 คน — คนแรกที่กดเป็นฝ่ายชนะ';
const D2 = 'Media Group: Digital VGI\nMedia Category: DIGITAL\nMedia Type (Epicor/SF): QATEST-BTS\nSale Package: BTS MAX 2.0 Half B';
const s2 = [
  ['S2-01', 'Sale', 'Sale สร้าง Ticket สื่อ VGI (BTS)', '1. เมนู MEDIA APPROVAL > Media Ticket > Create Ticket แล้วเลือก "No Quotation Number"', '-', 'เปิดฟอร์ม Ticket information'],
  ['S2-01', 'Sale', '', '2. กรอก Client, Product, Contract และเลือก Media Group → Category → Media Type (Epicor/SF)', 'Client: QA Test Client <เลขที่ไม่ซ้ำ>\nProduct: QA Multi Product\nContract: วันที่ 1 – 28 ของเดือนปัจจุบัน\n' + D2.split('\n').slice(0, 3).join('\n'), 'เลือกได้ครบทั้ง 3 ช่อง (Media Type (Epicor/SF) ต้องมี QATEST-BTS)'],
  ['S2-01', 'Sale', '', '3. Add Job เลือก Sale Package แล้วกรอก Duration, Period, Material link, Brief link', 'Sale Package: BTS MAX 2.0 Half B\nDuration: 0 min 15 sec\nPeriod: วันที่ 1 – 21\nMaterial / Brief: https://example.com/material.jpg , https://example.com/brief.pdf', 'มี Job 1 รายการ พร้อมส่ง'],
  ['S2-01', 'Sale', '', '4. กด Submit ticket แล้วกด Confirm', '-', 'ขึ้น "Ticket submitted successfully" กด OK แล้วเห็น Ticket ใหม่ในหน้า Media Ticket'],

  ['S2-02', 'Head CG', 'Head CG Assign งานให้ CG 2 คนพร้อมกัน', '1. เมนู Assign Ticket ค้นหา Client แล้วกดไอคอน Assign', 'Client: QA Test Client … ที่สร้างในขั้นก่อน', 'พบ Job สถานะ "Assign" เปิด dialog "Assign Graphic Designer" ที่ช่อง Graphic Designer ขึ้น "Multiple selection"'],
  ['S2-02', 'Head CG', '', '2. เลือก CG - QA และ CG - QA 2 (2 คน)', 'Designer: CG - QA และ CG - QA 2', 'แสดง "Selected 2 people: …" ปุ่ม Assign กดได้'],
  ['S2-02', 'Head CG', '', '3. กด Assign (ถ้ามี modal กด OK)', '-', 'Job เป็นสถานะ "Verify" ช่อง Assigned แสดงทั้ง CG - QA 2 และ CG - QA'],

  ['S2-03', 'CG (CG - QA) และ CG 2 (CG - QA 2)', 'CG ทั้งสองคนเห็นงานและพร้อมทำ', '1. ทั้งสองคนเข้า MEDIA APPROVAL > Verify & Production ค้นหาเลข Ticket แล้วเปิด Job', 'Ticket: TK-… ของ Ticket ที่สร้าง', 'ทั้งสองคนเห็น Job สถานะ "Verify" และเปิด Job detail ได้ ข้อมูลตรงกัน'],
  ['S2-03', 'CG (CG - QA) และ CG 2 (CG - QA 2)', '', '2. ดูปุ่มในการ์ด "Accept Job" ของแต่ละคน', '-', 'ปุ่ม Accept กดไม่ได้จนกว่าจะเลือก Work Type; ปุ่ม Feedback กดได้'],

  ['S2-04', 'CG 2 (CG - QA 2) และ CG (CG - QA)', 'คนแรกที่กด Accept ชนะ อีกคนถูกปฏิเสธ', '1. CG 2 เปิดหน้า Job ค้างไว้ (ยังไม่กดอะไร)', '-', 'หน้า Job ของ CG 2 ยังเป็นสถานะ Verify'],
  ['S2-04', 'CG (CG - QA)', '', '2. CG เลือก Work Type แล้วกด Accept และกด Confirm', 'Work Type: Animate', 'ขึ้นการ์ด "Submit Prove" Job เปลี่ยนเป็น "On Process"'],
  ['S2-04', 'CG 2 (CG - QA 2)', '', '3. CG 2 (ยังอยู่หน้าเดิม) เลือก Work Type แล้วกด Accept และ Confirm', 'Work Type: Mockup (Sales Pitch)', 'ขึ้น "Something Went Wrong: This job\'s status has already changed (now: On Process) — please refresh the page and try again" ไม่มี action ซ้ำ'],
  ['S2-04', 'CG 2 (CG - QA 2)', '', '4. กด OK แล้วรีเฟรชหน้า แล้วกด History', '-', 'เห็นการ์ด Submit Prove (ไม่มีปุ่ม Accept) และใน History มีรายการ "On Process" เพียงรายการเดียว โดยเป็นของ CG - QA'],

  ['S2-05', 'CG 2 (CG - QA 2) และ CG (CG - QA)', 'คนแรกที่กด Submit Prove ชนะ', '1. ทั้งสองคนเปิด Job สถานะ On Process (CG - QA เปิดหน้าค้างไว้)', '-', 'ทั้งสองคนมีฟอร์ม Submit Prove ใช้งานได้'],
  ['S2-05', 'CG 2 (CG - QA 2)', '', '2. CG 2 ใส่ URL LINK แล้วกด Submit Prove และ Confirm', 'URL: https://example.com/prove-cg2.jpg', 'ขึ้น "Prove submitted successfully — New Prove version submitted · Job → Review"'],
  ['S2-05', 'CG (CG - QA)', '', '3. CG (หน้าเดิม) ใส่ URL LINK แล้วกด Submit Prove และ Confirm', 'URL: https://example.com/prove-cg1.jpg', 'ขึ้น "Something Went Wrong: Choose Feedback revision, Re-Edit or Skip supplement." ไม่เกิด Prove ซ้ำ'],
  ['S2-05', 'CG และ CG 2', '', '4. ทั้งสองคนเปิดหน้า Verify & Production ค้นหา Ticket', '-', 'Job สถานะ "Review" และคอลัมน์ Prove = 1 ทั้งสองคน'],

  ['S2-06', 'Sale', 'Sale ตั้ง Airtime และ Approve ทุก Format', '1. เปิด Media Ticket > Ticket > Airtime Allocate เลือก Duration, ใส่ Number Spot/Loop และวันออกอากาศ แล้วกด Save Allocations', 'Duration: 7.5\nNumber Spot/Loop: 2\nOn-Air: วันที่ 1 – 20 ของเดือนปัจจุบัน', 'ขึ้น "Saved successfully"'],
  ['S2-06', 'Sale', '', '2. กลับหน้า Ticket กดปุ่ม Review ของ Job แล้วกด "Apply to all pending" และเลือก Approve (Final approval)', '-', 'ทุก Format เป็น Approve ในสรุปด้านล่าง'],
  ['S2-06', 'Sale', '', '3. แนบไฟล์หลักฐานการอนุมัติ (Ticket นี้ไม่มี Quotation) แล้วกด Submit Review และ Submit', 'ไฟล์: approval-evidence.pdf (ไฟล์ PDF ใดก็ได้)', 'ขึ้น "Review Submitted — Saved: … Approve" Job เป็นสถานะ "Final Approve" (Customer Approved, Landlord Pending)'],

  ['S2-07', 'Media Management', 'Landlord Approve', '1. เมนู Media Management เปิด Job ของ Ticket นั้น', '-', 'เห็น "Waiting for landlord approval" และปุ่ม Feedback / Approve'],
  ['S2-07', 'Media Management', '', '2. กด Approve แล้วกด Confirm', '-', 'ขึ้น "Approval Complete — CU+LL approval complete → Final Render" Job เป็นสถานะ "Final Render"'],

  ['S2-08', 'CG และ CG 2', 'คนแรกที่กด Render ชนะ แล้ว Job เป็น Done', '1. ทั้งสองคนเปิด Job สถานะ Final Render (CG 2 เปิดหน้าค้างไว้)', '-', 'ทั้งสองคนเห็นปุ่ม Render File ใช้งานได้'],
  ['S2-08', 'CG (CG - QA)', '', '2. CG กรอก File Name แล้วกด Render File', 'File Name: qa_bts_render', 'แสดงตัวอย่างชื่อไฟล์ของทุก Format (รูปแบบ yyyymmdd…_qa_bts_render_<Format>)'],
  ['S2-08', 'CG (CG - QA)', '', '3. กด Confirm File Name Render', '-', 'Job เป็น "Done" มีข้อความ "This job is closed — no further edits are allowed" และ "Rendered Files (n formats) Confirmed"'],
  ['S2-08', 'CG 2 (CG - QA 2)', '', '4. CG 2 (หน้าเดิม) กรอก File Name แล้วกด Render File และ Confirm', 'File Name: qa_bts_render_cg2', 'ขึ้น "Something Went Wrong: This job\'s status has already changed (now: Done)" หลังรีเฟรชเห็นเฉพาะไฟล์ของ CG - QA'],
];


// ---------------- Scenario 3: Media Management สร้าง Ticket เอง + Landlord Feedback (e2e 05-01) ----------------
const S3 = 'Media Management สร้าง Ticket เองและเดิน flow เอง — Landlord Feedback ไม่กระทบ workflow';
const D3 = 'Media Group: Digital VGI\nMedia Category: DIGITAL\nMedia Type (Epicor/SF): QATEST-BTS\nSale Package: BTS MAX 2.0 Half B';
const s3 = [
  ['S3-01', 'Media Management', 'Media Management สร้าง Ticket ด้วยตนเอง', '1. เข้าสู่ระบบด้วย Media Management เมนู MEDIA APPROVAL > Media Ticket > Create Ticket แล้วเลือก "No Quotation Number"', '-', 'เปิดฟอร์ม Ticket information และมีตัวเลือก "Created by Media Management as" (Landlord / Plan B / Other) โดย Landlord ถูกเลือกไว้เป็นค่าเริ่มต้น'],
  ['S3-01', 'Media Management', '', '2. กรอก Client, Product, Contract และเลือก Media Group → Category → Media Type (Epicor/SF)', 'Client: QA Test Client <เลขที่ไม่ซ้ำ>\nProduct: QA Multi Product\nContract: วันที่ 1 – 28 ของเดือนปัจจุบัน\n' + D3.split('\n').slice(0, 3).join('\n'), 'ช่อง Sales Person แสดง "Media Management - QA" (ผู้สร้างเป็น Sales Person ของ Ticket)'],
  ['S3-01', 'Media Management', '', '3. Add Job เลือก Sale Package แล้วกรอก Duration, Period, Material link, Brief link', 'Sale Package: BTS MAX 2.0 Half B\nDuration: 0 min 15 sec\nPeriod: วันที่ 1 – 21\nMaterial / Brief: https://example.com/material.jpg , https://example.com/brief.pdf', 'มี Job 1 รายการ พร้อมส่ง'],
  ['S3-01', 'Media Management', '', '4. กด Submit ticket แล้วกด Confirm', '-', 'ขึ้น "Ticket submitted successfully" กด OK แล้วเห็น Ticket ใหม่ในหน้า Media Ticket'],

  ['S3-02', 'Head CG', 'Head CG Assign งานให้ CG 1 คน', '1. เมนู Assign Ticket ค้นหา Client แล้วกดไอคอน Assign เลือก CG - QA คนเดียว แล้วกด Assign', 'Designer: CG - QA', 'Job เปลี่ยนจาก "Assign" เป็น "Verify" ช่อง Assigned แสดง CG - QA'],

  ['S3-03', 'CG (CG - QA)', 'CG รับงานและส่ง Prove', '1. เมนู Verify & Production ค้นหาเลข Ticket เปิด Job เลือก Work Type แล้วกด Accept และ Confirm', 'Work Type: Final File', 'Job เป็น "On Process" ขึ้นการ์ด Submit Prove'],
  ['S3-03', 'CG (CG - QA)', '', '2. ใส่ URL LINK แล้วกด Submit Prove และ Confirm', 'URL: https://example.com/qa-prove.jpg', 'ขึ้น "Prove submitted successfully" Job เป็น "Review"'],

  ['S3-04', 'Media Management', 'Media Management อนุมัติ Ticket ของตัวเองในฐาน Sale', '1. เปิด Media Ticket > Ticket > Airtime Allocate เลือก Duration, ใส่ Number Spot/Loop และวันออกอากาศ แล้วกด Save Allocations', 'Duration: 7.5\nNumber Spot/Loop: 2\nOn-Air: วันที่ 1 – 20 ของเดือนปัจจุบัน', 'ขึ้น "Saved successfully"'],
  ['S3-04', 'Media Management', '', '2. กลับหน้า Ticket กดปุ่ม Review ของ Job เลือก "Apply to all pending" แล้ว Approve (Final approval)', '-', 'ทุก Format เป็น Approve'],
  ['S3-04', 'Media Management', '', '3. แนบไฟล์หลักฐานการอนุมัติ แล้วกด Submit Review และ Submit', 'ไฟล์: approval-evidence.pdf (PDF ใดก็ได้)', 'ขึ้น "Review Submitted" Job เป็น "Final Approve"'],
  ['S3-04', 'Media Management', '', '4. เมนู Media Management เปิด Job ของ Ticket นั้น', '-', 'ส่วน Approval Result แสดง Customer Approved โดย "Media Management - QA" (อนุมัติเอง) และ Landlord ยังเป็น "Pending Approval" ("Waiting for landlord approval") มีปุ่ม Feedback และ Approve'],

  ['S3-05', 'Media Management', 'Landlord กด Feedback — เป็นเพียงความเห็น ไม่กระทบ workflow', '1. กดปุ่ม Feedback แล้วกด Send Feedback โดยยังไม่กรอก Note', '-', 'ยังไม่ส่ง (dialog "Send Feedback" ค้างอยู่ ต้องกรอก Note ก่อน)'],
  ['S3-05', 'Media Management', '', '2. กรอก Note แล้วกด Send Feedback (ถ้ามี modal กด OK)', 'Note: QA Test landlord feedback: only a comment, the workflow must not change', 'ขึ้น "Feedback Sent — Feedback sent · JOB-…"'],
  ['S3-05', 'Media Management และ CG (CG - QA)', '', '3. Media Management รีเฟรชหน้า Job และ CG เปิด Verify & Production ดู Job เดิม', '-', 'Job ยังเป็น "Final Approve" (CU Approved / LL Pending) ไม่ถูกส่งกลับไปสถานะอื่น และปุ่ม Approve ยังกดได้'],

  ['S3-06', 'Media Management', 'เคส Cancel approve — ยกเลิกการ Approve ไม่มีอะไรเปลี่ยน', '1. กดปุ่ม Approve ที่หน้า Job (ขึ้น dialog "Approve Job — confirm approval from the Landlord (LL)") แล้วกด Cancel', '-', 'dialog ปิด Job ยังเป็น "Final Approve", Landlord ยัง "Pending Approval" และปุ่ม Approve ยังกดได้'],

  ['S3-07', 'Media Management', 'เคส Approve — Landlord อนุมัติ Job ไปต่อจนจบ (ทำต่อจาก S3-06 ใน Ticket เดียวกัน)', '1. กดปุ่ม Approve แล้วกด Confirm', '-', 'ขึ้น "Approval Complete — CU+LL approval complete → Final Render" Job เป็น "Final Render"'],
  ['S3-07', 'CG (CG - QA)', '', '2. เปิด Job ที่ Verify & Production กรอก File Name แล้วกด Render File', 'File Name: qa_mm_render', 'แสดงตัวอย่างชื่อไฟล์ของทุก Format (yyyymmdd…_qa_mm_render_<Format>)'],
  ['S3-07', 'CG (CG - QA)', '', '3. กด Confirm File Name Render', '-', 'Job เป็น "Done" มีข้อความ "This job is closed — no further edits are allowed" และ "Rendered Files (n formats) Confirmed"'],
];

async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'QA';
  const addSheet = (name, scenario, rows) => {
    const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = [
      { header: COLS[0], key: 'scenario', width: 30 },
      { header: COLS[1], key: 'id', width: 9 },
      { header: COLS[2], key: 'role', width: 22 },
      { header: COLS[3], key: 'desc', width: 34 },
      { header: COLS[4], key: 'step', width: 52 },
      { header: COLS[5], key: 'data', width: 44 },
      { header: COLS[6], key: 'expected', width: 62 },
      { header: COLS[7], key: 'actual', width: 30 },
      { header: COLS[8], key: 'status', width: 12 },
    ];
    const head = ws.getRow(1);
    head.height = 24;
    head.eachCell((c) => {
      c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
      c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    let lastId = '';
    let band = false;
    for (const [id, role, desc, step, data, expected] of rows) {
      if (id !== lastId) band = !band;
      lastId = id;
      const r = ws.addRow({ scenario, id, role, desc, step, data, expected, actual: '', status: '' });
      r.eachCell((c) => {
        c.alignment = { vertical: 'top', wrapText: true };
        c.border = { top: { style: 'thin', color: { argb: 'FFBBBBBB' } }, left: { style: 'thin', color: { argb: 'FFBBBBBB' } }, bottom: { style: 'thin', color: { argb: 'FFBBBBBB' } }, right: { style: 'thin', color: { argb: 'FFBBBBBB' } } };
        if (band) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F6FB' } };
      });
      r.getCell('id').font = { bold: true };
      r.getCell('status').dataValidation = { type: 'list', allowBlank: true, formulae: ['"Pass,Fail,Blocked,N/A"'] };
    }
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLS.length } };
    ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
    return ws;
  };
  addSheet('1 Assign 1 คน', S1, s1);
  addSheet('2 VGI Assign 2 คน', S2, s2);
  addSheet('3 MM สร้างเอง', S3, s3);
  const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'reports', 'E2E-Manual-Test-Cases.xlsx'); // ถ้า Excel เปิดไฟล์เดิมค้างอยู่ ให้ระบุชื่อไฟล์ใหม่เป็น argument
  await wb.xlsx.writeFile(out);
  console.log('Wrote', out, '| sheet 1 rows:', s1.length, '| sheet 2 rows:', s2.length, '| sheet 3 rows:', s3.length);
}
build();
