const packages = [
  {
    name: "Gói Khám Sức Khỏe Tổng Quát Cơ Bản",
    code: "PKG_BASIC",
    description: "Phù hợp cho mọi đối tượng cần kiểm tra sức khỏe định kỳ. Bao gồm xét nghiệm máu, siêu âm bụng, X-quang phổi và tư vấn bác sĩ đa khoa.",
    fixed_price: 1500000,
    duration_minutes: 60,
    is_active: true,
    booking_count: 125,
  },
  {
    name: "Gói Tầm Soát Ung Thư Nam Giới",
    code: "PKG_CANCER_MALE",
    description: "Tầm soát các bệnh lý ung thư phổ biến ở nam giới (Gan, Phổi, Dạ Dày, Tiền Liệt Tuyến). Tặng kèm nội soi tai mũi họng.",
    fixed_price: 3200000,
    duration_minutes: 120,
    is_active: true,
    booking_count: 45,
  },
  {
    name: "Gói Tầm Soát Ung Thư Nữ Giới",
    code: "PKG_CANCER_FEMALE",
    description: "Tầm soát ung thư Vú, Cổ tử cung, Buồng trứng, Tuyến giáp. Bao gồm chụp Mammography và Pap smear.",
    fixed_price: 3500000,
    duration_minutes: 150,
    is_active: true,
    booking_count: 89,
  },
  {
    name: "Gói Khám Tim Mạch Chuyên Sâu",
    code: "PKG_CARDIO",
    description: "Điện tâm đồ, Siêu âm tim, Đo Holter huyết áp 24h và Khám chuyên khoa Tim Mạch bởi chuyên gia.",
    fixed_price: 2500000,
    duration_minutes: 90,
    is_active: true,
    booking_count: 156,
  },
  {
    name: "Gói Khám Sức Khỏe Tiền Hôn Nhân",
    code: "PKG_PRE_MARRIAGE",
    description: "Kiểm tra sức khỏe tổng quát, xét nghiệm các bệnh truyền nhiễm, siêu âm tử cung/tinh hoàn và tư vấn di truyền.",
    fixed_price: 4000000,
    duration_minutes: 180,
    is_active: true,
    booking_count: 67,
  },
  {
    name: "Gói Nội Soi Tiêu Hóa Tiền Mê",
    code: "PKG_GASTRO",
    description: "Nội soi dạ dày - đại tràng tiền mê không đau. Tầm soát ung thư đường tiêu hóa và vi khuẩn HP.",
    fixed_price: 4500000,
    duration_minutes: 180,
    is_active: true,
    booking_count: 210,
  }
];

const seed = async () => {
  for (const pkg of packages) {
    try {
      const res = await fetch("http://localhost:3000/api/v1/service-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkg)
      });
      if (res.ok) {
        console.log("Seeded:", pkg.name);
      } else {
        console.error("Failed to seed:", pkg.name, await res.text());
      }
    } catch (err) {
      console.error("Error connecting to backend:", err);
    }
  }
};

seed();
