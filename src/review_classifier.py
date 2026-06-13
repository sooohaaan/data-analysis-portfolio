"""
리뷰 키워드 카테고리 분류기 (다국어, 규칙 기반) — 2계층(도메인) 재분류용.

배경: 초기 분류는 충전 7개 카테고리만 두어 부정 리뷰의 50%가 '기타'로 빠졌다.
원인은 app_reviews의 92%가 Green SM(베트남 EV '라이드헤일링' 앱 Xanh SM)이라
충전과 무관한 배차·드라이버·광고 불만이 대부분이었기 때문.
이를 (1) 라이드헤일링 (2) 충전 (3) 앱 공통 3개 도메인으로 분리하고,
vi/th/en/ko 다국어 키워드를 보강해 '기타'를 50% → ~16%로 축소했다.

사용:
    from review_classifier import classify, CATEGORY_DOMAIN
    cat, dom = classify("ứng dụng lỗi liên tục")   # -> ('앱오류·작동불가', '앱공통')
"""
import re

# (카테고리, 도메인, 정규식) — 위에서부터 우선순위(가장 구체적인 것 먼저), 첫 매칭 채택.
# 도메인: 충전 | 라이드 | 앱공통 | 검토(감성오분류) | 미상(기타)
TH_APP = r"แอป|แอพ|แอฟ|แอ็ป|แอ๊ป|application"
RULES = [
    ("프로모션·할인", "라이드", r"ưu đãi|ưu đai|mã giảm|giảm giá|khuyến mãi|khuyến mại|khuyến mai|mã giới thiệu|mã giản|voucher|\bpromo\b|coupon|tích điểm|ส่วนลด|โปรโมชั่น|프로모션|할인쿠폰"),
    ("결제·환불·지갑", "앱공통", r"thanh toán|thanh toan|trừ tiền|trừ ti|hoàn tiền|hoàn ti|nạp tiền|không hoàn|mất tiền|tính tiền|hóa đơn|hoá đơn|\bthẻ\b|\bví\b|\bwallet\b|credit card|payment|refund|\bpaid\b|deduct|คืนเงิน|จ่ายเงิน|ชำระเงิน|วิธีชำระ|บัตรเครดิต|คิดเงิน|เติมเงิน|결제|환불|지갑|voucher|bị trừ"),
    ("요금·비쌈", "라이드", r"giá cao|giá.*cao|đắt|quá đắt|mắc quá|giá.*mắc|chặt chém|giá cả|giá cước|cước phí|phí cao|expensive|\bprice\b|cao hơn grab|cao hơn be|tăng giá|phụ thu|thu thêm|แพง|요금|비싸|đắt đỏ"),
    ("외국인·다국어", "앱공통", r"thai only|tiếng anh|tiếng việt|english only|no english|no language option|không có tiếng|ngôn ngữ|foreigner|foreign.*(card|phone|number|cannot)|local phone|passport|hộ chiếu|ภาษาอังกฤษ|ต่างชาติ|ภาษา|외국인|영어|다국어"),
    ("충전속도", "충전", r"sạc chậm|sạc lâu|sạc rất lâu|tốc độ sạc|charging.*slow|slow.*charg|chậm sạc|ชาร์จ.*ช้า|충전.*느|slow charge"),
    ("충전소·위치", "충전", r"trạm sạc|\btrạm\b|charging station|charger.*(near|location|where)|sạc ở đâu|ชาร์จ.*ที่ไหน|สถานีชาร์จ|สถานี|ปั้ม|หมุดไม่ขึ้น|충전소|cây sạc|điểm sạc|trụ sạc"),
    ("충전기·세션", "충전", r"\bqr\b|quét mã|kết nối|không kết nối|bluetooth|handshake|cổng sạc|cắm sạc|sạc không|không sạc|ชาร์จไม่|ชาร์จไม่ได้|หัวชาร์จ|หัว ac|สถานะการชาร์จ|ดูการชาร์จ|type.*ชาร์จ|충전.*안|커넥터|연결|스캔"),
    ("목적지·경로", "라이드", r"điểm đến|điểm đón|nhập.*điểm|tìm.*điểm|nhảy.*điểm|chọn.*điểm|địa chỉ|sai địa|đặt sai|tìm.*địa|nhập.*địa|chỉ đường|dẫn đường|sai đường|lộ trình|tuyến đường|จุดหมาย|ที่อยู่|เส้นทาง|주소|목적지|경로"),
    ("위치·GPS부정확", "앱공통", r"định vị|sai chỗ|sai vị trí|bản đồ.*sai|sai bản đồ|\bgps\b|bản đồ|vị trí.*sai|lệch|map.*wrong|แผนที่|พิกัด|위치.*틀"),
    ("배차·호출실패", "라이드", r"không có tài xế|ko có tài xế|không ai nhận|ko ai nhận|không xe|không có xe|ko có xe|không có tài|đặt xe|đặt mãi|gọi xe|không gọi được|không bắt được|không đặt được|đặt không được|đặt đc|đặt được xe|khó đặt|chờ.*lâu|đợi.*lâu|chờ mãi|đợi mãi|đợi hoài|hủy chuyến|huỷ chuyến|hủy cuốc|huỷ cuốc|hủy chuy|tài xế.*hủy|nhận.*hủy|tự hủy|tự huỷ|cancel.*trip|no driver|book.*ride|không.*nhận chuyến|không ai chạy|không ai bật|để đó không|không chịu đón|chia đơn|ép nhận|ép đơn|trời mưa|\bchuyến\b|cuốc xe|bắt xe|đặt tài|xe nào nhận|เรียกรถ|ไม่มีรถ|รอรถ|รอนาน"),
    ("드라이버·서비스불만", "라이드", r"tài xế|tài xê|tài x|lái xe|chạy ẩu|driver|thái độ|vô văn hoá|vô văn hóa|thiếu trách nhiệm|ngâm|coi lại tài|nguy hiểm|đi ẩu|คนขับ|ขับรถ"),
    ("광고", "앱공통", r"quảng cáo|quảng cao|quản cáo|\bqc\b|advertis|\bads?\b|marketing|โฆษณา|광고|pop.?up"),
    ("알림·스팸", "앱공통", r"thông báo|noti\b|notify|notification|làm phiền|spam|kêu cả ngày|แจ้งเตือน|알림|푸시"),
    ("회원·구독", "앱공통", r"gói thành viên|thành viên|hủy gói|huỷ gói|membership|subscription|đăng ký gói|สมาชิก|구독|멤버십"),
    ("계정·인증·KYC", "앱공통", r"đăng nhập|đăng ki|đăng kí|đăng ký|tài khoản|\botp\b|xác minh|xác thực|số điện thoại|\bsđt\b|sai mật khẩu|mật khẩu|login|log in|register|sign in|sign up|\bkyc\b|verif|activate|account|ลงทะเบียน|สมัคร|ยืนยันตัวตน|สแกนหน้า|สแกน.*ยาก|เข้าสู่ระบบ|รหัส|อีเมล|로그인|계정|인증|가입|\broot\b|trợ năng"),
    ("설치·업데이트", "앱공통", r"cài đặt|cài lại|cài lai|cập nhật|cap nhat|\bupdate\b|version|phiên bản|gỡ.*cài|không cài|tải về|tải lâu|tải mãi|download|อัปเดต|อัพเดท|อัปเดท|ติดตั้ง|업데이트|설치|버전|bản mới"),
    ("고객센터·CS", "앱공통", r"hỗ trợ|ho tro|tổng đài|cskh|chăm sóc khách|customer service|liên hệ|phản hồi|không trả lời|không phản hồi|ติดต่อ|ศูนย์บริการ|ขอความช่วยเหลือ|고객|문의|상담|support|hotline"),
    ("앱오류·작동불가", "앱공통", rf"không mở|ko mở|không vào|ko vào|không dùng được|ko dùng được|dùng ko được|không sử dụng được|không chạy|ko chạy|không hiện|ko hiện|không nhập|ko nhập|đơ\b|treo\b|bị treo|\blag\b|giật|sập|crash|force close|văng|thoát ra|lỗi liên tục|liên tục lỗi|\blỗi\b|\bloi\b|loi hoai|lỗi hoài|\bbug\b|hỏng|error|stopped working|not working|cannot open|can.?t open|does ?n.?t (open|start)|doesn't open|unreliable|not.*reliable|không hoạt động|ko hoạt động|đứng máy|loading|quay vòng|trắng màn|màn hình|treo máy|app.*lỗi|chậm chạp|({TH_APP}).*(ช้า|หน่วง|ล่าช้า|อืด|ค้าง|ล่ม|เด้ง|เด่ง|ดับ|หลุด|มีปัญหา|ไม่ได้|บัค|เน่า|ไม่เสถียร)|(ช้า|หน่วง|ค้าง|ล่ม|เด้ง|เด่ง|หลุด|เน่า|มีปัญหา|เข้าไม่ได้|เข้าไม่ค่อยได้|เปิดไม่ได้|ปิดไม่ได้|ใช้ไม่ได้|ใช้งานไม่ได้|ไม่เสถียร|ระบบ.*ไม่พร้อม|ไม่พัฒนาระบบ)|เน็ต.*ช้า|net.*slow|ddos|오류|먹통|버그|에러|튕|không ổn định"),
    ("UI·UX불편", "앱공통", r"giao diện|giao dien|khó dùng|khó sử dụng|khó hiểu|rắc rối|phức tạp|không tiện|kém tiện|interface|\bui\b|\bux\b|design|ใช้งานยาก|ใช้ยาก|불편|디자인|복잡|discount.*ẩn|khó thao tác|rườm rà"),
    ("사기·신뢰", "앱공통", r"lừa đảo|\blừa\b|gian lận|scam|fraud|cheat|ăn cắp|móc túi|bịp|uy tín|มั่ว|หลอก|โกง|사기|lua dao"),
    ("일반혹평", "앱공통", r"^tệ|quá tệ|rất tệ|\btệ\b|\bdở\b|quá dở|kém|chán|thất vọng|tồi|tệ hại|tệ nhất|worst|\bbad\b|terrible|disappoint|useless|stupid|tồi tệ|별로|최악|실망|쓰레기|\bnản\b|bực|thua grab|thua be|kém grab|tệ hơn|\bngu\b|nguu|như cc|rác|vớ vẩn|chả ra|phiền|ห่วย|แย่|ไม่ดี|กาก|งง|không tiến bộ|không tiện lợi"),
]
COMPILED = [(c, d, re.compile(p)) for c, d, p in RULES]
CATEGORY_DOMAIN = {c: d for c, d, _ in RULES}
CATEGORY_DOMAIN["긍정오분류"] = "검토"
CATEGORY_DOMAIN["기타·미상"] = "미상"

_POS = re.compile(r"rất tốt|rất tôt|quá tốt|\btốt\b|\btôt\b|tuyệt|hài lòng|cảm ơn|cám ơn|văn minh|thân thiện|\bổn\b|\bgood\b|great|\blove\b|excellent|\bnice\b|\bok\b|oke|tuyệt vời|ủng hộ|quá hay|rất hay|nghiện|dependable|ดีมาก|\bดี\b|เยี่ยม|รวดเร็ว|สะดวก")
_NEG = re.compile(r"không|ko |kg |chẳng|chả |chưa|hông|\bnot\b|\bno\b|ไม่")


def classify(text):
    """리뷰 텍스트 → (카테고리, 도메인). 매칭 없으면 긍정오분류 또는 기타·미상."""
    t = (text or "").lower()
    if len(t.strip()) < 2:
        return ("기타·미상", "미상")
    for cat, dom, rx in COMPILED:
        if rx.search(t):
            return (cat, dom)
    if _POS.search(t) and not _NEG.search(t):
        return ("긍정오분류", "검토")
    return ("기타·미상", "미상")
