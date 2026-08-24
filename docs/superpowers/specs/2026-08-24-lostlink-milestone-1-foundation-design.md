# LostLink Milestone 1 Foundation Design

## Trạng thái tài liệu

- Ngày: 2026-08-24
- Trạng thái thiết kế: Đã được người dùng phê duyệt
- Phạm vi: Milestone 1 - nền tảng kỹ thuật và môi trường chạy cục bộ
- Trạng thái triển khai: Chưa bắt đầu

Tài liệu này ghi lại thiết kế đã được phê duyệt trước khi lập kế hoạch triển khai chi tiết. Đây không phải là mã nguồn, không thay thế các tài liệu nguồn trong `docs/source/`, và không tự động thay đổi Planning Baseline đã được đóng băng.

Một thay đổi có kiểm soát đối với Planning Baseline là bắt buộc trước khi triển khai: thay lựa chọn MinIO hiện có trong `docs/DECISIONS.md` và `docs/TECH_STACK.md` bằng Garage. Tài liệu nguồn gốc chỉ yêu cầu một hệ thống object storage và không chỉ định MinIO, vì vậy đây là thay đổi quyết định công nghệ ở lớp planning, không phải thay đổi nghiệp vụ hay service boundary.

## 1. Mục tiêu

Milestone 1 tạo nền tảng tối thiểu để LostLink có thể bước vào giai đoạn phát triển microservices mà không triển khai trước nghiệp vụ.

Kết quả mong muốn:

- Có cấu trúc monorepo rõ ràng cho Web Client, các backend service và AI Inference Service.
- Mỗi service có thể cài đặt, khởi động, dừng và kiểm tra sức khỏe độc lập.
- Toàn bộ môi trường cục bộ có thể khởi động bằng một lệnh Docker Compose.
- PostgreSQL thể hiện đúng quyền sở hữu dữ liệu theo service và không cho phép đọc chéo schema.
- RabbitMQ và object storage sẵn sàng cho các milestone nghiệp vụ sau.
- Có cấu hình được kiểm tra khi khởi động, log có cấu trúc và correlation identifier.
- Có bộ smoke test đủ để xác nhận nền tảng hoạt động.

Milestone này không triển khai workflow nghiệp vụ `Report → Moderation → Matching → Claim → Verification → Handover → Resolution/Audit`.

## 2. Phạm vi

### 2.1 Trong phạm vi

- Khởi tạo npm workspace tại root repository.
- Tạo Web Client bằng React và Vite.
- Tạo các Node.js service bằng NestJS:
  - API Gateway;
  - Identity Service;
  - Lost-and-Found Service;
  - Matching Service.
- Tạo AI Inference Service bằng FastAPI.
- Tạo package dùng chung chỉ dành cho contract phù hợp.
- Cấu hình PostgreSQL, RabbitMQ và Garage trong môi trường cục bộ.
- Thiết lập schema và database user riêng cho các stateful service.
- Thiết lập config validation, health endpoints, JSON logging và correlation identifier.
- Thiết lập OpenAPI ở mức nền tảng.
- Viết smoke test và integration check cho Milestone 1.

### 2.2 Ngoài phạm vi

- Không triển khai authentication, account hoặc role.
- Không triển khai lost/found report, moderation hoặc state machine.
- Không triển khai matching, Rule Score hoặc domain event.
- Không triển khai AI inference thực tế hoặc chọn AI model.
- Không triển khai claim, verification, handover, dispute hoặc notification.
- Không tạo business table, business migration hoặc dữ liệu mẫu nghiệp vụ.
- Không tạo Kubernetes, CI/CD, distributed tracing hoặc một observability stack đầy đủ.
- Không thêm microservice ngoài service boundary đã được phê duyệt.
- Không tạo endpoint nghiệp vụ giả chỉ để làm đầy scaffold.

## 3. Cấu trúc repository

```text
apps/
  web/
services/
  api-gateway/
  identity-service/
  lost-found-service/
  matching-service/
  ai-inference-service/
packages/
  contracts/
infra/
docs/
```

Quy tắc cấu trúc:

- Root sử dụng npm workspaces, không dùng Turborepo trong Phase 1.
- `apps/web` là Web Client duy nhất.
- Mỗi Node.js service là một package độc lập, có cấu hình, test và Dockerfile riêng.
- `ai-inference-service` là project Python độc lập và không thuộc npm workspace.
- `packages/contracts` chỉ được chứa contract có thể chia sẻ hợp lệ, chẳng hạn contract event được version hóa. Package này không được chứa Entity, Repository, domain model implementation hoặc business logic.
- Trong Milestone 1 chưa tạo domain contract khi nghiệp vụ tương ứng chưa được triển khai.

## 4. Component và service boundary

### 4.1 Web Client

- Là giao diện người dùng của hệ thống.
- Chỉ gọi API public qua API Gateway.
- Không gọi trực tiếp internal service.
- Trong Milestone 1 chỉ cần application shell tối thiểu và smoke test, không có màn hình nghiệp vụ.

### 4.2 API Gateway

- Là public entry point duy nhất.
- Chịu trách nhiệm routing nền tảng, correlation identifier và health endpoint.
- Không sở hữu database hoặc domain data.
- Không chứa business decision.

### 4.3 Identity Service

- Sẽ sở hữu identity/auth domain trong các milestone sau.
- Là stateful service sở hữu `identity_schema`.
- Milestone 1 chỉ tạo nền tảng service, kết nối database của chính nó và health checks.

### 4.4 Lost-and-Found Service

- Là owner của report, moderation, claim, secret evidence, verification, handover, dispute, notification Phase 1 và nghiệp vụ audit liên quan.
- Là stateful service sở hữu `lost_found_schema`.
- Là service duy nhất được cấp quyền truy cập object storage cho item image.
- Milestone 1 chưa triển khai các nghiệp vụ trên.

### 4.5 Matching Service

- Sẽ sở hữu active-report read model, candidate filtering, Rule Score, candidate ranking, match result/history và AI similarity integration.
- Là stateful service sở hữu `matching_schema`.
- Không được nhận hoặc lưu secret ownership evidence.
- Milestone 1 chỉ tạo nền tảng service, kết nối database của chính nó và health checks.

### 4.6 AI Inference Service

- Là service Python stateless trong Phase 1.
- Không sở hữu database.
- Không có object storage credential.
- Không nhận secret evidence và không đưa ra quyết định ownership.
- AI luôn là dependency tùy chọn; việc AI lỗi không được chặn core workflow.
- Milestone 1 chỉ cung cấp nền tảng service và health endpoints, chưa có model hoặc inference endpoint nghiệp vụ.

## 5. Runtime và công nghệ nền tảng

| Thành phần | Lựa chọn đã duyệt | Chính sách |
|---|---|---|
| Node.js runtime | Node.js 24 LTS | Dùng patch ổn định và pin trong môi trường build/runtime |
| Backend framework | NestJS 11 | Dùng release ổn định; exact dependency versions được khóa bằng lockfile |
| Web Client | React 19.2 + Vite 8 | Dùng release ổn định; exact dependency versions được khóa bằng lockfile |
| Python runtime | Python 3.13 | Dùng patch ổn định và pin trong container/runtime |
| AI service framework | FastAPI | Exact dependency versions được khóa trong `requirements.txt` |
| ORM/migration | Prisma 7 GA | Mỗi stateful service có Prisma schema/config/migration history riêng |
| Database | PostgreSQL 18 | Dùng image tag bất biến theo patch |
| Message broker | RabbitMQ 4.3 | Dùng image tag bất biến theo patch |
| Object storage | Garage 2.3 | Single-node trong local Phase 1; dùng S3-compatible API |
| Local orchestration | Docker Compose | Một lệnh khởi động toàn bộ môi trường |

Không sử dụng floating tag như `latest`. Các package JavaScript được khóa bằng `package-lock.json`; package Python được pin exact version trong `requirements.txt`; container image phải dùng tag cụ thể. Patch version ban đầu sẽ được xác nhận và ghi vào implementation plan ngay trước khi scaffold để tránh ghi nhận một patch đã lỗi thời.

## 6. Hạ tầng và quyền sở hữu dữ liệu

### 6.1 PostgreSQL

Phase 1 sử dụng một PostgreSQL server để đơn giản hóa vận hành, nhưng giữ data ownership độc lập:

| Service | Schema sở hữu | Database user |
|---|---|---|
| Identity Service | `identity_schema` | User riêng của Identity Service |
| Lost-and-Found Service | `lost_found_schema` | User riêng của Lost-and-Found Service |
| Matching Service | `matching_schema` | User riêng của Matching Service |

Mỗi database user:

- được đọc/ghi schema của chính service;
- bị từ chối khi truy cập schema của service khác;
- không dùng chung credential với service khác.

API Gateway và AI Inference Service không có database credential. Không service nào được cross-read hoặc cross-write schema.

### 6.2 RabbitMQ

- Chạy trong internal Docker network.
- Không mở public endpoint cho Web Client.
- Milestone 1 chỉ xác nhận broker có thể khởi động và các service dự kiến có thể được cấp cấu hình phù hợp.
- Chưa tạo domain event, exchange hoặc queue nghiệp vụ nếu chưa có contract được duyệt.
- Thiết kế sau này phải hỗ trợ idempotent consumer, Outbox direction và controlled retry theo Planning Baseline.

### 6.3 Garage object storage

- Chạy single-node trong local Phase 1.
- Dùng S3-compatible API để giảm coupling với một sản phẩm cụ thể.
- Bucket mặc định là private.
- Chỉ Lost-and-Found Service nhận access key/secret key.
- API Gateway, Identity Service, Matching Service và AI Inference Service không có storage credential.
- Hệ thống không phụ thuộc vào object ACL hoặc policy nâng cao chưa được Garage hỗ trợ đầy đủ; quyền truy cập object được kiểm soát tại Lost-and-Found Service.
- Exact storage location và protected original media không được public trực tiếp.
- Việc đổi object storage provider trong tương lai phải giữ service boundary và đi qua S3-compatible storage adapter.

### 6.4 Thay đổi MinIO thành Garage

Planning Baseline hiện ghi MinIO trong một quyết định công nghệ. Thiết kế đã phê duyệt thay MinIO bằng Garage 2.3 vì:

- tài liệu nguồn chỉ yêu cầu object storage, không khóa sản phẩm;
- Garage có S3-compatible API phù hợp với nhu cầu object upload/download cơ bản;
- mô hình single-node dễ tiếp cận cho môi trường học tập và local development;
- MinIO community repository và Docker image đã chuyển sang trạng thái archived trong năm 2026, làm tăng rủi ro bảo trì cho lựa chọn mới.

Trước khi implementation bắt đầu, change-control task riêng phải cập nhật ít nhất `docs/DECISIONS.md`, `docs/TECH_STACK.md`, các câu hỏi/quyết định liên quan và `docs/PROJECT_STATUS.md` nếu trạng thái thay đổi. Không được âm thầm triển khai Garage trong khi planning document có authority cao hơn vẫn ghi MinIO.

## 7. Cấu hình và secret management

- Repository có một root `.env.example` chỉ chứa tên biến và giá trị mẫu không nhạy cảm.
- File `.env` thật bị Git ignore.
- Docker Compose chỉ truyền những biến mà từng component thực sự cần.
- NestJS dùng `@nestjs/config` kết hợp Joi để validate cấu hình.
- FastAPI dùng Pydantic Settings để validate cấu hình.
- Sai hoặc thiếu cấu hình bắt buộc khiến component fail fast khi khởi động.
- Không log secret, connection string đầy đủ, access key, token hoặc credential.
- Không đưa secret vào response của health endpoint hoặc OpenAPI document.

Việc một dependency tạm thời chưa sẵn sàng không được xem như cấu hình sai. Process vẫn có thể live trong khi readiness báo fail và tự phục hồi khi dependency hoạt động lại.

## 8. Health và startup behavior

Mỗi HTTP component cung cấp:

- `GET /health/live`: xác nhận process đang chạy; không phụ thuộc vào external dependency.
- `GET /health/ready`: xác nhận các dependency bắt buộc của component đang sẵn sàng.

Nguyên tắc:

- Identity, Lost-and-Found và Matching phải kiểm tra database thuộc quyền sở hữu của chính mình ở readiness.
- Lost-and-Found kiểm tra object storage khi storage là dependency bắt buộc của capability đang được đưa vào sử dụng.
- Broker health được quan sát độc lập; readiness rule không được làm business transaction phụ thuộc trực tiếp vào broker availability trái với Outbox direction.
- AI là optional dependency của Matching và không được khiến core system mất readiness chỉ vì AI unavailable.
- Docker Compose dùng health condition phù hợp, không chỉ dựa vào thứ tự start container.
- Component phải có thể start/stop độc lập khi các dependency bắt buộc tương ứng đã sẵn sàng.

## 9. Logging và correlation identifier

- Log mặc định ở dạng JSON trên standard output.
- Không thêm ELK, Prometheus/Grafana hoặc distributed tracing trong Milestone 1.
- API Gateway nhận `X-Correlation-Id` hợp lệ từ request hoặc tự tạo nếu thiếu.
- Gateway trả correlation identifier trong response và truyền nó đến internal HTTP call.
- Internal service giữ correlation identifier trong log và response liên quan.
- Domain event ở milestone sau phải mang correlation identifier khi phù hợp.
- Log không được chứa secret evidence hoặc sensitive payload.

## 10. OpenAPI và error behavior

- Mỗi HTTP service có OpenAPI document cho endpoint mà service đó thực sự sở hữu.
- Gateway OpenAPI chỉ mô tả public API.
- Internal service OpenAPI chỉ phục vụ local development và không public trực tiếp trong production topology.
- Milestone 1 chỉ mô tả health endpoint; không tạo endpoint nghiệp vụ giả.
- Error response nền tảng phải nhất quán ở mức status code, machine-readable error code/message và correlation identifier.
- Chi tiết error contract nghiệp vụ sẽ được xác định cùng requirement tương ứng, không được tự suy diễn trong scaffold.

## 11. Chiến lược kiểm thử Milestone 1

### 11.1 Unit/smoke test theo component

- NestJS: Jest và Supertest.
- React/Vite: Vitest và React Testing Library.
- FastAPI: pytest và TestClient.

Mỗi component có ít nhất smoke test xác nhận application khởi tạo được và health behavior đúng với dependency state được mô phỏng.

### 11.2 Integration verification

- Khởi động toàn bộ môi trường bằng một Docker Compose command.
- Kiểm tra health của Web Client, API Gateway, bốn internal service và ba infrastructure component.
- Xác nhận stateful service kết nối được schema riêng.
- Xác nhận từng database user bị từ chối khi truy cập schema khác.
- Xác nhận Lost-and-Found Service có thể truy cập Garage bằng credential riêng.
- Xác nhận các component khác không được cấp Garage credential.
- Xác nhận Gateway tạo/truyền/trả `X-Correlation-Id`.
- Xác nhận AI service dừng không làm core service bị đánh dấu unavailable chỉ vì AI là optional dependency.

Không viết business test cho requirement chưa được triển khai trong Milestone 1.

## 12. Trình tự triển khai đề xuất

1. Thực hiện controlled planning change từ MinIO sang Garage và xin human approval cho baseline amendment.
2. Tạo npm workspace và cấu trúc thư mục đã duyệt.
3. Scaffold Web Client và năm service, không thêm business feature.
4. Thiết lập config validation, health endpoints, JSON logging và correlation identifier.
5. Cấu hình PostgreSQL, RabbitMQ và Garage với data/credential isolation.
6. Tạo Dockerfile và Docker Compose cho full local environment.
7. Viết và chạy smoke test, integration check và schema-isolation check.
8. Cập nhật traceability/project status theo factual evidence và đánh dấu milestone `READY_FOR_REVIEW`.

Không được bắt đầu bước sau nếu bước trước tạo ra architecture conflict chưa được giải quyết.

## 13. Tiêu chí hoàn thành kỹ thuật

Milestone 1 chỉ đạt trạng thái sẵn sàng để human review khi:

- Cấu trúc repository đúng thiết kế và không có service ngoài Phase 1.
- Mỗi component có thể build, start và stop độc lập.
- Full local environment khởi động bằng một Docker Compose command.
- Không dùng floating dependency hoặc container tag.
- Mỗi stateful service chỉ truy cập được schema của mình.
- Không có cross-service Entity, Repository, domain implementation hoặc business logic dùng chung.
- Chỉ API Gateway là public entry point.
- Health endpoints phản ánh đúng liveness/readiness.
- AI unavailable không chặn core environment hoặc Rule-based direction.
- Chỉ Lost-and-Found Service có Garage credential.
- Correlation identifier được tạo, truyền và ghi log đúng.
- Tất cả test và verification check thuộc Milestone 1 đều pass.
- Không có domain feature được triển khai ngoài phạm vi.
- Traceability và project status phản ánh đúng evidence thực tế.

Codex chỉ được ghi `READY_FOR_REVIEW`. Việc đánh milestone `COMPLETED`, freeze baseline sửa đổi hoặc chuyển phase cần người dùng phê duyệt.

## 14. Rủi ro và biện pháp kiểm soát

### Rủi ro: Scaffold biến thành business implementation

Kiểm soát bằng cách chỉ tạo health, config, logging, storage/database connectivity và smoke tests; không tạo domain endpoint hoặc business entity.

### Rủi ro: Microservices bị coupling qua code hoặc database

Kiểm soát bằng package độc lập, Prisma schema/migration riêng, database user riêng và integration test từ chối cross-schema access.

### Rủi ro: Garage bị dùng như public file server

Kiểm soát bằng private bucket, credential chỉ ở Lost-and-Found Service và application-level authorization. Không phụ thuộc vào object ACL.

### Rủi ro: Health check làm sai reliability boundary

Kiểm soát bằng cách tách liveness/readiness, xem AI là optional, và không làm business transaction phụ thuộc trực tiếp vào broker availability.

### Rủi ro: Phiên bản công nghệ thay đổi trước lúc triển khai

Kiểm soát bằng stable/LTS-only policy, xác minh patch version ngay trước scaffold, pin exact version và không dùng `latest`.

## 15. Việc phải hoàn tất trước implementation plan

- Người dùng review và xác nhận tài liệu thiết kế này phản ánh đúng các lựa chọn đã duyệt.
- Thực hiện controlled Planning Baseline amendment cho Garage và các tài liệu liên quan.
- Xác nhận không còn conflict giữa spec này và planning documents có authority cao hơn.
- Sau đó mới lập implementation plan theo requirement/milestone, chưa thực thi code ngay.

## 16. Tài liệu tham chiếu

Tài liệu nội bộ có authority cao hơn:

- `docs/source/LostLink_Microservices.docx`
- `docs/source/2026-08-23-lostlink-microservices-design.md`
- `docs/REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/SERVICE_BOUNDARIES.md`
- `docs/DECISIONS.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/TECH_STACK.md`

Nguồn kỹ thuật dùng để kiểm tra tính khả dụng của lựa chọn object storage:

- Garage documentation: <https://garagehq.deuxfleurs.fr/documentation/quick-start/>
- Garage S3 compatibility: <https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/>
- MinIO releases: <https://github.com/minio/minio/releases>
- MinIO Docker image tags: <https://hub.docker.com/r/minio/minio/tags>
