CREATE TABLE `admin` (
  `us_id` int(11) NOT NULL,
  `us_username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `us_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
);

INSERT INTO `admin` (`us_id`, `us_username`, `us_password`) VALUES
(1, 'admin', 'admin');

CREATE TABLE `clients` (
  `cl_id` int(11) NOT NULL,
  `cl_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cl_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cl_password` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cl_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cl_is_active` int(11) NOT NULL DEFAULT '1',
  `cl_phone` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cl_status` int(11) NOT NULL
);

INSERT INTO `clients` (`cl_id`, `cl_name`, `cl_email`, `cl_password`, `cl_created_at`, `cl_is_active`, `cl_phone`, `cl_status`) VALUES
(1, 'اسم المطعم هنا', 'rayan@example.com', '', '2025-07-08 15:14:19', 1, '07834113500', 0),
(2, 'كافتيريا بغداد', 'baghdad@example.com', '', '2025-07-08 15:14:19', 1, '757575', 0),
(3, 'شسيش', 'alhagree@hotmail.com', '7548', '2025-07-08 16:47:48', 1, '095', 0),
(4, '999', 'alhagree@hotmail.com', '', '2025-07-10 16:59:17', 1, '4455', 0),
(5, 'عميل تجريبي 1', NULL, '', '2025-07-03 21:00:00', 1, '', 1),
(6, 'عميل تجريبي 2', NULL, '', '2025-07-04 21:00:00', 1, '', 1),
(7, 'عميل تجريبي 3', NULL, '', '2025-07-05 21:00:00', 1, '', 1),
(8, 'عميل تجريبي 4', NULL, '', '2025-07-06 21:00:00', 1, '', 1),
(9, 'عميل تجريبي 5', NULL, '', '2025-07-07 21:00:00', 1, '', 1),
(12, 'شسيش', 'alhagree@yahoo.com', '', '2025-07-12 11:25:15', 1, '4555', 0);

CREATE TABLE `items` (
  `it_id` int(11) NOT NULL,
  `it_se_id` int(11) NOT NULL,
  `it_name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `it_price` double NOT NULL,
  `it_description` text COLLATE utf8mb4_unicode_ci,
  `it_image` text COLLATE utf8mb4_unicode_ci,
  `it_is_active` int(11) DEFAULT '1'
);

INSERT INTO `items` (`it_id`, `it_se_id`, `it_name`, `it_price`, `it_description`, `it_image`, `it_is_active`) VALUES
(1, 1, 'عصير ليمون نعناع', 2000, 'عصير ليمون طازج مع أوراق النعناع المثلجة.', '1752857860823-a3ea27606db099934502e8e4aa042653_w750_h500.jpg', 1),
(2, 1, 'عصير جزر وبرتقال', 2000, 'مزيج صحي من الجزر والبرتقال بفيتامين C.', '1752857797273-9999147872.jpg', 1),
(3, 14, 'شاي كرك', 500, '', '1752338472476-info.png', 1),
(4, 1, 'عصير رمان', 2000, 'مركز ومنعش، غني بمضادات الأكسدة.', '1752857721407-29314-Ø¹ØµÙØ±.jpg', 1),
(5, 1, 'عصير برتقال', 2000, 'عصير طازج 100% من البرتقال الطبيعي بدون إضافات', '1752857662833-tbl_articles_article_20874_64472056cb5-2b35-4913-8998-fdeeb28f3101.gif', 1),
(6, 1, 'عصير كوكتيل', 3000, 'مزيج من الفواكه الموسمية (تفاح، فراولة، موز).', '1752857935355-shutterstock_472205491-638x654.jpg', 1),
(7, 2, 'شاي', 500, 'شاي كلاسيكي يقدم ساخنًا مع سكر أو بدون.', '1752860604710-upload_1661922584_1551448590.jpg', 1),
(8, 2, 'شاي بنعناع', 1000, 'شاي أحمر طازج بأوراق نعناع.', '1752860644145-pexels-mareefe-1417945.webp', 1),
(9, 2, 'قهوة تركية', 1500, 'تقليدية، محضرة على نار هادئة برغوة كثيفة.', '1752860690465-ÙÙÙØ©-ØªØ±ÙÙØ©-ÙØ­ÙØ¯-Ø§ÙÙØ¯Ù.jpg', 1),
(10, 5, 'تفاحتين', 7000, 'سيبيسبيسب', '1752861191062-G92gx8mGphEWKgFyP1KJwTdXGHmSjwJd8vfu3dnA.jpg', 1);
CREATE TABLE `sections` (
  `se_id` int(11) NOT NULL,
  `se_name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `se_description` text COLLATE utf8mb4_unicode_ci,
  `se_image` text COLLATE utf8mb4_unicode_ci,
  `se_is_active` int(11) DEFAULT '1',
  `se_client_id` int(11) DEFAULT NULL
);

INSERT INTO `sections` (`se_id`, `se_name`, `se_description`, `se_image`, `se_is_active`, `se_client_id`) VALUES
(1, 'عصاير طبيعية', 'عصاير طبيعية 100%', '1752857325139-images.jpeg', 1, 1),
(2, 'مشروبات ساخنة', 'مشروبات ساخنة شاي قهوة', '1752857338373-c08d7fcbd441e017e6a272106bfcc0f9_w750_h750.jpeg', 1, 1),
(3, 'مشروبات باردة', 'مشروبات باردة مثلجة', '1752857345390-8nNcben77o2iUc4QoDp2GEVWpe8CsXmZfFbvYRpW.webp', 1, 1),
(4, 'وجبات', 'وجبات سريعة', '1752857352402-Ø§ÙØ·Ø¹Ø§Ù.jpg', 1, 1),
(5, 'اراكيل', 'اراكيل بكافة الانواع', '1752857358015-G92gx8mGphEWKgFyP1KJwTdXGHmSjwJd8vfu3dnA.jpg', 1, 1),
(14, 'مشروبات ساخنة', 'مشروبات ساخنة شاي قهوة', 'eecf9a470b868453f2c5f9e6/1752337882451-Nineveh_Governorate_Seal.png', 1, 2);

CREATE TABLE `settings` (
  `st_id` int(11) NOT NULL,
  `st_cl_id` int(11) NOT NULL,
  `st_logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `st_background` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
);

INSERT INTO `settings` (`st_id`, `st_cl_id`, `st_logo`, `st_background`) VALUES
(1, 1, '1752511260785-Nineveh_Governorate_Seal.png', '1752511656654-images (2).jpeg'),
(2, 2, '1752511780438-the-peer-group-inc-logo-png_seeklogo-433981.png', NULL);

CREATE TABLE `subscriptions` (
  `su_id` int(11) NOT NULL,
  `su_client_id` int(11) NOT NULL,
  `su_status` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `su_start_date` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `su_end_date` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `su_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'renew',
  `su_duration` int(11) DEFAULT NULL
);

INSERT INTO `subscriptions` (`su_id`, `su_client_id`, `su_status`, `su_start_date`, `su_end_date`, `su_type`, `su_duration`) VALUES
(39, 1, 'inactive', '2025-07-01', '2026-01-01', 'renew', 6),
(40, 2, 'active', '2025-07-12', '2026-07-12', 'renew', 12),
(41, 4, 'active', '2025-07-12', '2026-01-12', 'first', 6),
(42, 6, 'active', '2025-07-12', '2025-09-12', 'first', 2);

CREATE TABLE `us_users` (
  `us_id` int(11) NOT NULL,
  `us_client_id` int(11) NOT NULL,
  `us_username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `us_password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `us_link_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `us_is_active` tinyint(1) DEFAULT '1'
);

INSERT INTO `us_users` (`us_id`, `us_client_id`, `us_username`, `us_password`, `us_link_code`, `us_is_active`) VALUES
(12, 1, 'user_1', 'user_1', 'eecf9a470b868453f2c5f9e6', 1),
(13, 2, 'user_2', 'user_2', '3070c03f9a5cef8b757d8f06', 1),
(14, 5, 'user_5', '843f4db8', '9d7db77b3116d41b0377f0bf', 1),
(15, 4, 'user_4', '33f7ee84', 'e27d7b98ba8a4df04bade1e9', 1),
(16, 6, 'user_6', '695d345c', 'f2a13210456183eb76868ebc', 1);
CREATE TABLE `visits` (
  `vs_id` int(11) NOT NULL,
  `vs_us_link_code` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `vs_ip_address` text COLLATE utf8mb4_unicode_ci,
  `vs_user_agent` text COLLATE utf8mb4_unicode_ci,
  `vs_visit_time` datetime DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `admin`
  ADD PRIMARY KEY (`us_id`),
  ADD UNIQUE KEY `username` (`us_username`);

ALTER TABLE `clients`
  ADD PRIMARY KEY (`cl_id`);

ALTER TABLE `items`
  ADD PRIMARY KEY (`it_id`),
  ADD KEY `it_se_id` (`it_se_id`);

ALTER TABLE `sections`
  ADD PRIMARY KEY (`se_id`),
  ADD KEY `fk_sections_clients` (`se_client_id`);

ALTER TABLE `settings`
  ADD PRIMARY KEY (`st_id`),
  ADD KEY `st_cl_id` (`st_cl_id`);

ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`su_id`),
  ADD KEY `client_id` (`su_client_id`);

ALTER TABLE `us_users`
  ADD PRIMARY KEY (`us_id`),
  ADD UNIQUE KEY `us_username` (`us_username`),
  ADD UNIQUE KEY `us_link_code` (`us_link_code`),
  ADD KEY `fk_us_client` (`us_client_id`);

ALTER TABLE `visits`
  ADD PRIMARY KEY (`vs_id`);

ALTER TABLE `admin`
  MODIFY `us_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `clients`
  MODIFY `cl_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

ALTER TABLE `items`
  MODIFY `it_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `sections`
  MODIFY `se_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

ALTER TABLE `settings`
  MODIFY `st_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `subscriptions`
  MODIFY `su_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

ALTER TABLE `us_users`
  MODIFY `us_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `visits`
  MODIFY `vs_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`it_se_id`) REFERENCES `sections` (`se_id`);

ALTER TABLE `sections`
  ADD CONSTRAINT `fk_sections_clients` FOREIGN KEY (`se_client_id`) REFERENCES `clients` (`cl_id`) ON DELETE CASCADE;

ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`st_cl_id`) REFERENCES `clients` (`cl_id`) ON DELETE CASCADE;

ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`su_client_id`) REFERENCES `clients` (`cl_id`);

ALTER TABLE `us_users`
  ADD CONSTRAINT `fk_us_client` FOREIGN KEY (`us_client_id`) REFERENCES `clients` (`cl_id`) ON DELETE CASCADE;
