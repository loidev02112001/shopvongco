BEGIN;

UPDATE users
SET phone = CASE email
    WHEN 'admin@local.test' THEN '0901000001'
    WHEN 'manager@local.test' THEN '0901000002'
    WHEN 'user@local.test' THEN '0901000003'
  END,
  avatar_url = CASE email
    WHEN 'admin@local.test' THEN '/src/assets/logo.png'
    WHEN 'manager@local.test' THEN '/src/assets/brand-mission.jpg'
    WHEN 'user@local.test' THEN '/src/assets/tryon-real-1.jpg'
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE email IN ('admin@local.test', 'manager@local.test', 'user@local.test');

INSERT INTO addresses (
  id, user_id, recipient_name, phone, province, district, ward, street, is_default
) VALUES
  ('addr-admin-1', 'local-admin', 'Local Admin', '0901000001', 'Ha Noi', 'Hoan Kiem', 'Hang Bac', '12 Hang Bac', TRUE),
  ('addr-manager-1', 'local-manager', 'Local Manager', '0901000002', 'Da Nang', 'Hai Chau', 'Thach Thang', '88 Le Loi', TRUE),
  ('addr-manager-2', 'local-manager', 'Local Manager', '0901000002', 'Da Nang', 'Son Tra', 'An Hai Bac', '25 Ngo Quyen', FALSE),
  ('addr-user-1', 'local-user', 'Local User', '0901000003', 'Ho Chi Minh', 'Quan 1', 'Ben Nghe', '120 Dong Khoi', TRUE),
  ('addr-user-2', 'local-user', 'Local User', '0901000003', 'Ho Chi Minh', 'Quan 3', 'Vo Thi Sau', '45 Vo Van Tan', FALSE)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  recipient_name = EXCLUDED.recipient_name,
  phone = EXCLUDED.phone,
  province = EXCLUDED.province,
  district = EXCLUDED.district,
  ward = EXCLUDED.ward,
  street = EXCLUDED.street,
  is_default = EXCLUDED.is_default;

INSERT INTO collections (
  id, name, title, intro, banner, thumbnail, is_visible, created_at
) VALUES
  ('graceful-muse', 'Nang Tho Thanh Lich', 'The Graceful Muse', 'Bo suu tap lay cam hung tu net dep thanh lich, tinh te va nu tinh.', '/src/assets/collection-1.png', '/src/assets/necklace-swan.jpg', TRUE, CURRENT_TIMESTAMP - INTERVAL '90 days'),
  ('huong-sac-mua-he', 'Huong Sac Mua He', 'Summer Colors', 'Nhung thiet ke tuoi sang, nhe nhang cho ngay he day nang.', '/src/assets/collection-2.png', '/src/assets/summer-butterfly-pink.jpg', TRUE, CURRENT_TIMESTAMP - INTERVAL '75 days'),
  ('pure-soul', 'Pure Soul', 'Pure Soul Collection', 'Trang suc trai tim ton vinh ve dep trong treo va cam xuc chan thanh.', '/src/assets/collection-3.png', '/src/assets/pure-soul-ruby-heart.jpg', TRUE, CURRENT_TIMESTAMP - INTERVAL '60 days'),
  ('thanh-nha', 'Thanh Nha', 'Elegant Essentials', 'Nhung mau day chuyen thanh lich de deo hang ngay va lam qua tang.', '/src/assets/cara-luna-banner.png', '/src/assets/thanh-nha-clover-onyx.jpg', TRUE, CURRENT_TIMESTAMP - INTERVAL '45 days')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  intro = EXCLUDED.intro,
  banner = EXCLUDED.banner,
  thumbnail = EXCLUDED.thumbnail,
  is_visible = EXCLUDED.is_visible;

INSERT INTO products (
  slug, img, name, short_name, price, description, specs, info,
  collection_id, images, created_at
) VALUES
  (
    'day-chuyen-thien-nga-trang',
    '/src/assets/necklace-swan.jpg',
    'Day chuyen Bac 925 Thien Nga Trang',
    'THIEN NGA TRANG',
    '690.000VND',
    'Thiet ke thien nga thanh lich, phu hop deo hang ngay va du tiec.',
    '{"chat_lieu":"Bac 925","mau_sac":"Bac trang","do_dai":"40cm + 5cm","bao_hanh":"12 thang"}',
    'San pham bac 925 cao cap, kem hop va khan lau.',
    'graceful-muse',
    '["/src/assets/swan-pave.jpg","/src/assets/swan-blue.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '40 days'
  ),
  (
    'day-chuyen-thien-nga-den',
    '/src/assets/swan-black.jpg',
    'Day chuyen Bac 925 Thien Nga Den',
    'THIEN NGA DEN',
    '720.000VND',
    'Mau thien nga den tao diem nhan sang trong va ca tinh.',
    '{"chat_lieu":"Bac 925","da":"Da tong hop","mau_sac":"Den","do_dai":"45cm"}',
    'Thiet ke thuoc bo suu tap The Graceful Muse.',
    'graceful-muse',
    '["/src/assets/swan-black.jpg","/src/assets/swan-pave.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '38 days'
  ),
  (
    'day-chuyen-thien-nga-xanh',
    '/src/assets/swan-blue.jpg',
    'Day chuyen Bac 925 Thien Nga Xanh',
    'THIEN NGA XANH',
    '750.000VND',
    'Vien da xanh trong treo ket hop bieu tuong thien nga mem mai.',
    '{"chat_lieu":"Bac 925","da":"Crystal xanh","mau_sac":"Xanh bien","do_dai":"40cm + 5cm"}',
    'San pham phu hop lam qua tang sinh nhat.',
    'graceful-muse',
    '["/src/assets/swan-blue.jpg","/src/assets/necklace-swan.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '35 days'
  ),
  (
    'buom-hong-mua-he',
    '/src/assets/summer-butterfly-pink.jpg',
    'Day chuyen Canh Buom Hong Mua He',
    'BUOM HONG MUA HE',
    '560.000VND',
    'Canh buom hong pastel tre trung, nhe nhang va de phoi do.',
    '{"chat_lieu":"Bac 925","mau_sac":"Hong pastel","do_dai":"40cm + 5cm","kieu_dang":"Canh buom"}',
    'Mau noi bat cua bo suu tap Huong Sac Mua He.',
    'huong-sac-mua-he',
    '["/src/assets/summer-butterfly-pink.jpg","/src/assets/summer-butterfly-crystal.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '32 days'
  ),
  (
    'buom-pha-le-mua-he',
    '/src/assets/summer-butterfly-crystal.jpg',
    'Day chuyen Canh Buom Pha Le',
    'BUOM PHA LE',
    '590.000VND',
    'Canh buom dinh da pha le bat sang nhe nhang theo chuyen dong.',
    '{"chat_lieu":"Bac 925","da":"Pha le tong hop","mau_sac":"Trang","do_dai":"45cm"}',
    'Thiet ke nu tinh danh cho nhung ngay he.',
    'huong-sac-mua-he',
    '["/src/assets/summer-butterfly-crystal.jpg","/src/assets/summer-hearts.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '30 days'
  ),
  (
    'trai-tim-mua-he',
    '/src/assets/summer-hearts.jpg',
    'Day chuyen Doi Tim Mua He',
    'DOI TIM MUA HE',
    '620.000VND',
    'Hai trai tim long vao nhau, bieu tuong cua su gan ket.',
    '{"chat_lieu":"Bac 925","mau_sac":"Bac hong","do_dai":"40cm + 5cm","kieu_dang":"Doi tim"}',
    'Qua tang phu hop cho ngay ky niem.',
    'huong-sac-mua-he',
    '["/src/assets/summer-hearts.jpg","/src/assets/pure-soul-heart-butterfly.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '28 days'
  ),
  (
    'trai-tim-ruby-pure-soul',
    '/src/assets/pure-soul-ruby-heart.jpg',
    'Day chuyen Ruby Heart Pure Soul',
    'RUBY HEART',
    '680.000VND',
    'Trai tim Ruby do noi bat tren nen bac 925 sang bong.',
    '{"chat_lieu":"Bac 925","da":"Ruby tong hop","mau_sac":"Do Ruby","do_dai":"45cm"}',
    'Thiet ke trai tim an tuong cua bo suu tap Pure Soul.',
    'pure-soul',
    '["/src/assets/pure-soul-ruby-heart.jpg","/src/assets/pure-soul-pink-heart-halo.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '25 days'
  ),
  (
    'trai-tim-hong-pure-soul',
    '/src/assets/pure-soul-pink-heart-halo.jpg',
    'Day chuyen Pink Heart Halo',
    'PINK HEART HALO',
    '640.000VND',
    'Trai tim hong duoc bao quanh boi vong da lap lanh.',
    '{"chat_lieu":"Bac 925","da":"Crystal hong","mau_sac":"Hong","do_dai":"40cm + 5cm"}',
    'Mau trang suc ngot ngao, hien dai.',
    'pure-soul',
    '["/src/assets/pure-soul-pink-heart-halo.jpg","/src/assets/pure-soul-heart-butterfly.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '22 days'
  ),
  (
    'trai-tim-canh-buom-pure-soul',
    '/src/assets/pure-soul-heart-butterfly.jpg',
    'Day chuyen Trai Tim Canh Buom',
    'HEART BUTTERFLY',
    '610.000VND',
    'Su ket hop giua trai tim va canh buom tao nen thiet ke mem mai.',
    '{"chat_lieu":"Bac 925","mau_sac":"Bac trang","do_dai":"45cm","kieu_dang":"Tim va canh buom"}',
    'Thiet ke tre trung thuoc bo suu tap Pure Soul.',
    'pure-soul',
    '["/src/assets/pure-soul-heart-butterfly.jpg","/src/assets/pure-soul-ruby-heart.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '20 days'
  ),
  (
    'co-bon-la-onyx',
    '/src/assets/thanh-nha-clover-onyx.jpg',
    'Day chuyen Co Bon La Onyx',
    'CLOVER ONYX',
    '790.000VND',
    'Co bon la Onyx den mang y nghia may man va phong cach thanh lich.',
    '{"chat_lieu":"Bac 925","da":"Onyx tong hop","mau_sac":"Den","do_dai":"45cm"}',
    'Mau cao cap cua bo suu tap Thanh Nha.',
    'thanh-nha',
    '["/src/assets/thanh-nha-clover-onyx.jpg","/src/assets/necklace-clover-new.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '18 days'
  ),
  (
    'hoa-doi-thanh-nha',
    '/src/assets/thanh-nha-flower-duo.jpg',
    'Day chuyen Hoa Doi Thanh Nha',
    'HOA DOI',
    '730.000VND',
    'Hai bong hoa nho tinh te tao diem nhan cho vung co.',
    '{"chat_lieu":"Bac 925","da":"Cubic Zirconia","mau_sac":"Trang","do_dai":"40cm + 5cm"}',
    'Thiet ke de deo hang ngay.',
    'thanh-nha',
    '["/src/assets/thanh-nha-flower-duo.jpg","/src/assets/necklace-blossom.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
  ),
  (
    'trai-tim-thanh-nha',
    '/src/assets/thanh-nha-heart.jpg',
    'Day chuyen Trai Tim Thanh Nha',
    'TRAI TIM THANH NHA',
    '650.000VND',
    'Thiet ke trai tim toi gian, phu hop moi phong cach.',
    '{"chat_lieu":"Bac 925","mau_sac":"Bac trang","do_dai":"45cm","bao_hanh":"12 thang"}',
    'San pham co ban de lam qua tang.',
    'thanh-nha',
    '["/src/assets/thanh-nha-heart.jpg","/src/assets/necklace-moon.jpg"]',
    CURRENT_TIMESTAMP - INTERVAL '12 days'
  )
ON CONFLICT (slug) DO UPDATE SET
  img = EXCLUDED.img,
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  info = EXCLUDED.info,
  collection_id = EXCLUDED.collection_id,
  images = EXCLUDED.images;

INSERT INTO slides (
  id, title, subtitle, image, link, sort_order, created_at
) VALUES
  ('slide-home-1', 'The Graceful Muse', 'Net dep thanh lich trong tung chi tiet', '/src/assets/cara-luna-banner.png', '/bo-suu-tap', 1, CURRENT_TIMESTAMP - INTERVAL '10 days'),
  ('slide-home-2', 'Thu vong co truc tuyen', 'Trai nghiem trang suc voi cong nghe AR', '/src/assets/tryon-ar-banner.png', '/thu-vong-co', 2, CURRENT_TIMESTAMP - INTERVAL '9 days'),
  ('slide-home-3', 'Pure Soul Collection', 'Qua tang nho, cam xuc lon', '/src/assets/hero-ar.png', '/bo-suu-tap', 3, CURRENT_TIMESTAMP - INTERVAL '8 days'),
  ('slide-home-4', 'Thanh Nha Moi Ngay', 'Nhung thiet ke de deo va de yeu', '/src/assets/brand-mission.jpg', '/bo-suu-tap', 4, CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  image = EXCLUDED.image,
  link = EXCLUDED.link,
  sort_order = EXCLUDED.sort_order;

INSERT INTO orders (
  id, user_id, recipient_name, phone, address, payment_method,
  items, total_amount, status, created_at
) VALUES
  (
    'DH-LOCAL-001', 'local-user', 'Local User', '0901000003',
    '120 Dong Khoi, Ben Nghe, Quan 1, Ho Chi Minh', 'COD',
    '[{"slug":"day-chuyen-thien-nga-trang","name":"Day chuyen Bac 925 Thien Nga Trang","price":"690.000VND","quantity":1,"img":"/src/assets/necklace-swan.jpg"}]',
    690000, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '20 days'
  ),
  (
    'DH-LOCAL-002', 'local-user', 'Local User', '0901000003',
    '120 Dong Khoi, Ben Nghe, Quan 1, Ho Chi Minh', 'BANKING',
    '[{"slug":"buom-hong-mua-he","name":"Day chuyen Canh Buom Hong Mua He","price":"560.000VND","quantity":1,"img":"/src/assets/summer-butterfly-pink.jpg"},{"slug":"trai-tim-hong-pure-soul","name":"Day chuyen Pink Heart Halo","price":"640.000VND","quantity":1,"img":"/src/assets/pure-soul-pink-heart-halo.jpg"}]',
    1200000, 'SHIPPED', CURRENT_TIMESTAMP - INTERVAL '5 days'
  ),
  (
    'DH-LOCAL-003', 'local-user', 'Local User', '0901000003',
    '45 Vo Van Tan, Vo Thi Sau, Quan 3, Ho Chi Minh', 'COD',
    '[{"slug":"co-bon-la-onyx","name":"Day chuyen Co Bon La Onyx","price":"790.000VND","quantity":1,"img":"/src/assets/thanh-nha-clover-onyx.jpg"}]',
    790000, 'PENDING', CURRENT_TIMESTAMP - INTERVAL '1 day'
  ),
  (
    'DH-LOCAL-004', 'local-manager', 'Local Manager', '0901000002',
    '88 Le Loi, Thach Thang, Hai Chau, Da Nang', 'BANKING',
    '[{"slug":"trai-tim-ruby-pure-soul","name":"Day chuyen Ruby Heart Pure Soul","price":"680.000VND","quantity":2,"img":"/src/assets/pure-soul-ruby-heart.jpg"}]',
    1360000, 'PROCESSING', CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    'DH-LOCAL-005', 'local-manager', 'Local Manager', '0901000002',
    '25 Ngo Quyen, An Hai Bac, Son Tra, Da Nang', 'COD',
    '[{"slug":"hoa-doi-thanh-nha","name":"Day chuyen Hoa Doi Thanh Nha","price":"730.000VND","quantity":1,"img":"/src/assets/thanh-nha-flower-duo.jpg"}]',
    730000, 'CANCELLED', CURRENT_TIMESTAMP - INTERVAL '12 days'
  ),
  (
    'DH-LOCAL-006', 'local-admin', 'Local Admin', '0901000001',
    '12 Hang Bac, Hang Bac, Hoan Kiem, Ha Noi', 'BANKING',
    '[{"slug":"day-chuyen-thien-nga-xanh","name":"Day chuyen Bac 925 Thien Nga Xanh","price":"750.000VND","quantity":1,"img":"/src/assets/swan-blue.jpg"}]',
    750000, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '30 days'
  )
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  recipient_name = EXCLUDED.recipient_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  payment_method = EXCLUDED.payment_method,
  items = EXCLUDED.items,
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status;

INSERT INTO wishlist (id, user_id, product_slug, created_at) VALUES
  ('wish-001', 'local-user', 'trai-tim-ruby-pure-soul', CURRENT_TIMESTAMP - INTERVAL '8 days'),
  ('wish-002', 'local-user', 'co-bon-la-onyx', CURRENT_TIMESTAMP - INTERVAL '7 days'),
  ('wish-003', 'local-user', 'buom-pha-le-mua-he', CURRENT_TIMESTAMP - INTERVAL '6 days'),
  ('wish-004', 'local-manager', 'day-chuyen-thien-nga-den', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('wish-005', 'local-manager', 'hoa-doi-thanh-nha', CURRENT_TIMESTAMP - INTERVAL '4 days'),
  ('wish-006', 'local-admin', 'trai-tim-thanh-nha', CURRENT_TIMESTAMP - INTERVAL '3 days')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  product_slug = EXCLUDED.product_slug;

INSERT INTO reviews (
  id, product_slug, user_id, user_name, user_avatar, rating,
  comment, date_string, is_hidden, created_at
) VALUES
  ('review-001', 'day-chuyen-thien-nga-trang', 'local-user', 'Local User', '/src/assets/tryon-real-1.jpg', 5, 'San pham dep, dong goi ky va giao dung hen.', '01/06/2026', FALSE, CURRENT_TIMESTAMP - INTERVAL '20 days'),
  ('review-002', 'buom-hong-mua-he', 'local-user', 'Local User', '/src/assets/tryon-real-1.jpg', 5, 'Mau hong nhe, deo len rat xinh va sang da.', '05/06/2026', FALSE, CURRENT_TIMESTAMP - INTERVAL '16 days'),
  ('review-003', 'trai-tim-hong-pure-soul', 'local-user', 'Local User', '/src/assets/tryon-real-1.jpg', 4, 'Thiet ke dep, day chuyen hoi mong nhung van chac chan.', '08/06/2026', FALSE, CURRENT_TIMESTAMP - INTERVAL '13 days'),
  ('review-004', 'trai-tim-ruby-pure-soul', 'local-manager', 'Local Manager', '/src/assets/brand-mission.jpg', 5, 'Mau Ruby noi bat, phu hop lam qua tang.', '10/06/2026', FALSE, CURRENT_TIMESTAMP - INTERVAL '11 days'),
  ('review-005', 'hoa-doi-thanh-nha', 'local-manager', 'Local Manager', '/src/assets/brand-mission.jpg', 4, 'Mau thanh lich, co the deo di lam hang ngay.', '12/06/2026', FALSE, CURRENT_TIMESTAMP - INTERVAL '9 days'),
  ('review-006', 'day-chuyen-thien-nga-xanh', 'local-admin', 'Local Admin', '/src/assets/logo.png', 5, 'Vien da xanh bat sang tot, hoan thien dep.', '14/06/2026', FALSE, CURRENT_TIMESTAMP - INTERVAL '7 days'),
  ('review-007', 'co-bon-la-onyx', 'local-user', 'Local User', '/src/assets/tryon-real-1.jpg', 5, 'Co bon la Onyx nhin rat sang va de phoi trang phuc.', '17/06/2026', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
  ('review-008', 'trai-tim-thanh-nha', 'local-admin', 'Local Admin', '/src/assets/logo.png', 3, 'Mau don gian, phu hop nguoi thich phong cach toi gian.', '19/06/2026', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
  product_slug = EXCLUDED.product_slug,
  user_id = EXCLUDED.user_id,
  user_name = EXCLUDED.user_name,
  user_avatar = EXCLUDED.user_avatar,
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  date_string = EXCLUDED.date_string,
  is_hidden = EXCLUDED.is_hidden;

COMMIT;
