# Nhật Ký Phát Triển & Tối Ưu Hóa Mô Phỏng Toán PTex

Tài liệu này ghi lại toàn bộ quá trình thiết kế, tích hợp các mô phỏng Toán học (hình học động 2D/3D), các lỗi kỹ thuật phát sinh và giải pháp khắc phục tối ưu nhất cho cả hai giao diện Web (Desktop) và Mobile.

---

## 1. Quá Trình Làm Mô Phỏng (Từ Sơ Khởi Đến Hoàn Thiện)

Mục tiêu là xây dựng hệ thống mô phỏng tương tác cao phục vụ chương trình Toán Kết nối tri thức (Toán 10, 11, 12) sử dụng **JSXGraph** cho hình học 2D và **Plotly.js** cho hình học 3D. 

### Các bước phát triển cốt lõi:
1. **Thiết lập kiến trúc "Code ẩn trong Database"**: 
   - Mã nguồn JavaScript chạy mô phỏng được lưu trữ dưới dạng chuỗi (String) trong MongoDB (`simulations` collection).
   - Trang Next.js tải thông tin cấu hình từ MongoDB và render ra một IFrame độc lập. IFrame này tải thư viện JSXGraph và KaTeX qua CDN.
   - Cơ chế này giúp tách biệt logic nghiệp vụ đồ họa khỏi mã nguồn trang web Next.js, cho phép cập nhật hoặc thêm bài học mới mà không cần biên dịch lại toàn bộ dự án.
2. **Xây dựng bộ Seed dữ liệu**: Xây dựng API `POST /api/seed` để nạp nhanh toàn bộ 20 chương học liệu và các mô phỏng động mẫu vào MongoDB.
3. **Phát triển 5 mô phỏng chất lượng cao cho Toán 11 (Góc lượng giác)**:
   - *Mô phỏng 1 (Chiều quay)*: Vẽ cung xoắn ốc chuyển động trực quan thể hiện góc âm/dương đa vòng.
   - *Mô phỏng 2 (Bảng dấu)*: Chia đường tròn thành 4 phần tư, tự động tô màu góc tương ứng và hiển thị bảng dấu của Sin, Cos, Tan, Cot.
   - *Mô phỏng 3 (Góc liên quan đặc biệt)*: Trực quan hóa tính đối xứng hình học của các cặp góc Đối, Bù, Phụ, Hơn kém $\pi$.
   - *Mô phỏng 4 (Hệ thức Chasles)*: Biểu diễn 3 tia $U, V, W$ lượng giác và xác minh hệ thức Chasles.
   - *Mô phỏng 5 (Độ dài cung tròn)*: Trực quan hóa thước đo duỗi thẳng của một cung tròn có bán kính $R$ và số đo $\alpha$.

---

## 2. Các Lỗi Kỹ Thuật Đã Gặp & Cách Khắc Phục Tối Ưu

### Lỗi 1: Đường tròn bị dẹt thành hình elip (Aspect-Ratio Fix)
* **Nguyên nhân**: Khi tải trang chứa nhiều tab mô phỏng, các tab ẩn được Next.js thiết lập `display: none` để tối ưu tải. Do thẻ div chứa bảng vẽ bị ẩn tại thời điểm khởi tạo, JSXGraph không đo được kích thước thực tế của vùng chứa (chiều rộng và chiều cao bằng 0), dẫn đến việc tính toán sai tỷ lệ tọa độ khiến đường tròn lượng giác bị bóp dẹt.
* **Cách fix tối ưu**:
   - Loại bỏ `display: none` tạm thời khi chưa tải xong. Thay vào đó, thiết lập khung iframe luôn hiển thị ở kích thước tối đa và phủ một lớp màn hình chờ (`loading overlay`) tuyệt đối lên trên.
   - Đồng thời cấu hình cả hai tham số `{ keepAspectRatio: true, keepaspectratio: true }` cho JSXGraph để khóa cứng tỷ lệ $1:1$ giữa trục hoành và trục tung.

### Lỗi 2: Nhãn text KaTeX hiển thị mã HTML thô (Raw HTML String)
* **Nguyên nhân**: Trong JSXGraph, khi một điểm được khởi tạo với tên rỗng (`name: ''`), label của điểm đó sẽ không được khởi dựng đầy đủ (hoặc không kích hoạt được chế độ HTML). Khi gọi hàm `.setName(newName)` lần đầu tiên trong update, JSXGraph tự động khởi dựng label dưới dạng văn bản SVG thông thường (`display: 'internal'`), khiến toàn bộ mã nguồn HTML `<span class="katex">...` bị phơi bày thô trên bảng vẽ.
* **Cách fix tối ưu**: 
   - Luôn khởi tạo tên ban đầu chứa KaTeX hợp lệ (ví dụ: `name: math("M'(-\\\\alpha)")`) ngay khi gọi `board.create('point', ...)` để bắt buộc JSXGraph phải định hình label dạng HTML (`display: 'html'`) ngay từ đầu.
   - Trong hàm cập nhật `updateSimulation`, thay vì sử dụng phương thức `board.MPrime.setName(html)` vốn tự động mã hóa/escape các ký tự đặc biệt của thẻ HTML, ta gọi trực tiếp **`board.MPrime.label.setText(html)`** để truyền thẳng chuỗi KaTeX vào thuộc tính `innerHTML` của nhãn.

### Lỗi 3: Nhãn KaTeX nhấp nháy liên tiếp (Flickering Text) khi kéo thả
* **Nguyên nhân**: Khi người dùng kéo chuột hoặc chạy autoplay, hàm `updateSimulation` được thực thi liên tục (30-60 lần/giây). Việc gọi hàm cập nhật tên `.setName(...)` ở mỗi khung hình bắt buộc trình duyệt phải liên tục hủy và vẽ lại (re-render) cây DOM chứa KaTeX trong nhãn, tạo ra hiện tượng rung lắc, nhấp nháy chữ rất khó chịu.
* **Cách fix tối ưu**:
   - Đối với nhãn tĩnh như điểm gốc $M(\alpha)$: Gán tên một lần duy nhất tại hàm khởi tạo `initSimulation` và loại bỏ hoàn toàn khỏi hàm cập nhật `updateSimulation`.
   - Đối với nhãn động như điểm đối xứng $M'$: Nhãn này chỉ thay đổi khi đổi dropdown mối liên kết (Đối, Bù, Phụ, Hơn kém $\pi$). Ta lưu trữ trạng thái mối quan hệ hiện tại `board.currentRelation = relation` và chỉ thực hiện cập nhật label duy nhất **một lần** khi quan hệ này thực sự thay đổi.

### Lỗi 4: Xung đột và biến đổi ký tự KaTeX do nhiều lớp biên dịch (Double-Escaping Trap)
* **Nguyên nhân**: Mã JavaScript của mô phỏng được viết dưới dạng chuỗi template string trong `route.ts`. Khi lưu trữ, nạp API và truyền sang iframe, chuỗi này bị trình duyệt biên dịch và phân giải ký tự thoát nhiều lần. Ký tự `\alpha` trong database chỉ còn `alpha` hoặc bị hiểu nhầm thành các lệnh thoát của JS.
* **Cách fix tối ưu**: Áp dụng quy tắc bốn dấu gạch chéo ngược (`\\\\alpha`, `\\\\pi`) trong tệp seed `route.ts`. Điều này đảm bảo khi truyền qua API, nó giữ được hai dấu gạch chéo ngược (`\\alpha`), và khi JS trong iframe biên dịch, nó phân giải thành đúng một dấu gạch chéo ngược (`\alpha`) để gửi cho thư viện KaTeX xử lý.

### Lỗi 5: Hiện tượng lag giật Autoplay (Autoplay Lagging)
* **Nguyên nhân**: Ban đầu, mỗi lần autoplay chạy, hệ thống xóa toàn bộ board và vẽ lại từ đầu, đồng thời biên dịch lại KaTeX làm tụt FPS nghiêm trọng.
* **Cách fix tối ưu**: Phân tách logic mô phỏng thành `initSimulation` (chỉ khởi tạo phần tử một lần duy nhất) và `updateSimulation` (chỉ cập nhật tọa độ hình học của phần tử đã có và gọi `board.update()`), giúp chạy mượt mà 60fps.

---

## 3. Thiết Kế & Trình Bày Tối Ưu Trên Web (Desktop) và Mobile

Để mang lại trải nghiệm tối đa cho người dùng trên mọi thiết bị, hệ thống giao diện đã được thiết kế lại hoàn chỉnh:

### A. Trình bày trên Web (Desktop)
* **Bố cục Chia đôi màn hình (Split-Screen Layout)**: 
  - Khung hình đồ thị mô phỏng chiếm trọn **cột bên trái** (chiều rộng cố định hoặc linh hoạt lớn), bảng điều khiển và bảng thông số hiển thị ở **cột bên phải**.
  - Bố cục này giúp học sinh vừa di chuyển chuột kéo điểm hoặc thanh trượt vừa quan sát trực quan đồ thị lượng giác chuyển động đồng thời ở bên cạnh mà không cần phải cuộn trang lên xuống.
* **Tích hợp hộp điều khiển vào dưới đồ thị**: 
  - Đưa trực tiếp bộ điều khiển tham số vào chân đồ thị (sát đáy iframe) sử dụng bố cục dàn trải hàng ngang (`flex-row-wrap`). Việc này giải phóng không gian màn hình và gom toàn bộ tương tác vào một khung duy nhất.
* **Readout Panel nổi bật**: 
  - Sử dụng native React component để kết nối dữ liệu từ IFrame gửi lên qua `postMessage`. Card hiển thị thiết kế kính mờ (Glassmorphism) sang trọng với các công thức liên hệ lượng giác được tô màu neon phát sáng (`text-shadow`) rực rỡ và các trị số âm/dương bọc trong badge màu sắc độ tương phản cao, dễ quan sát trên nền tối.

### B. Trình bày trên Mobile (Responsive Stacked Layout)
* **Sắp xếp dòng chảy dọc (Vertical Stacking)**:
  - Khi màn hình nhỏ hơn 768px, giao diện tự động chuyển sang chế độ xếp chồng hàng dọc: **Đồ thị (360px) $\rightarrow$ Thông số mô phỏng (React) $\rightarrow$ Thanh trượt điều khiển**.
* **Ngăn chặn đè che khuất (Anti-Overlap)**:
  - Bằng cách đưa bảng thông số ra ngoài iframe và đặt nó ngay bên dưới đồ thị, người dùng điện thoại có thể thoải mái dùng ngón tay kéo thả điểm trực tiếp trên đường tròn lượng giác mà **hoàn toàn không bị bảng thông số đè lên che khuất góc nhìn**.
  - Các con số thay đổi và công thức lượng giác sẽ hiển thị liên tục, rõ ràng ngay phía dưới ngón tay kéo.
* **Loại bỏ thanh cuộn dọc (Scrollbar Optimization)**:
  - Bộ dropdown select và slider được thiết kế lại cực kỳ nhỏ gọn, loại bỏ thuộc tính cuộn dọc độc lập để học sinh có thể dùng cử chỉ vuốt tự nhiên của điện thoại để cuộn trang mượt mà.
  - Phần tử select dropdown có màu nền slate sẫm và chữ màu trắng rõ ràng, tránh hiện tượng chữ trắng nền trắng do kế thừa cài đặt hệ điều hành trên các dòng máy Android/iOS.
