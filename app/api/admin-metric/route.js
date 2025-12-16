import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Get filter parameter from query string
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "month"; // default: month
    const customDate = searchParams.get("date");
    const customMonth = searchParams.get("month");
    const customYear = searchParams.get("year");

    // Calculate date range based on filter
    const now = new Date();
    let startDate, endDate;

    if (filter === "day") {
      // Today only
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (filter === "month") {
      // This month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (filter === "year") {
      // This year
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (filter === "custom_date" && customDate) {
      // Specific date (YYYY-MM-DD)
      const dateParts = customDate.split("-");
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);

      startDate = new Date(year, month, day, 0, 0, 0);
      endDate = new Date(year, month, day, 23, 59, 59);
    } else if (filter === "custom_month" && customMonth) {
      // Specific month (YYYY-MM)
      const monthParts = customMonth.split("-");
      const year = parseInt(monthParts[0]);
      const month = parseInt(monthParts[1]) - 1;

      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59);
    } else if (filter === "custom_year" && customYear) {
      // Specific year (YYYY)
      const year = parseInt(customYear);

      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    // TOTAL PRODUK (tidak terfilter, karena ini total keseluruhan)
    const totalProduk = await prisma.produk.count();

    // TOTAL ORDER (filtered by date range & status diterima only)
    const totalOrder = await prisma.transaksi.count({
      where: {
        status: "diterima",
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // TOTAL SALES (filtered by date range & status diterima only)
    const totalSalesAgg = await prisma.transaksi.aggregate({
      where: {
        status: "diterima",
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { total_harga: true },
    });

    const totalSales = totalSalesAgg._sum.total_harga || 0;

    // PRODUK TERLARIS (filtered by date range & status diterima only)
    const top = await prisma.transaksi.groupBy({
      by: ["produkId"],
      where: {
        status: "diterima",
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { produkId: true },
      orderBy: { _count: { produkId: "desc" } },
      take: 1,
    });

    let produkTerlaris = "-";

    if (top.length > 0) {
      const p = await prisma.produk.findUnique({
        where: { id: top[0].produkId },
      });

      produkTerlaris = p?.nama ?? "-";
    }

    // GRAFIK DATA (dinamis berdasarkan filter, status diterima only)
    const transaksiFiltered = await prisma.transaksi.findMany({
      where: {
        status: "diterima",
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { tanggal: "asc" },
    });

    let grafikData = [];

    if (filter === "day" || filter === "custom_date") {
      // Grafik per jam (24 jam) - untuk hari ini atau tanggal tertentu
      const hourlyTotals = {};
      for (let i = 0; i < 24; i++) {
        hourlyTotals[i] = 0;
      }

      transaksiFiltered.forEach((tr) => {
        const hour = tr.tanggal.getHours();
        hourlyTotals[hour] += tr.total_harga || 0;
      });

      grafikData = Object.entries(hourlyTotals).map(([hour, total]) => ({
        tanggal: `${hour.toString().padStart(2, "0")}:00`,
        total,
      }));
    } else if (filter === "month" || filter === "custom_month") {
      // Grafik per hari dalam bulan
      let targetYear, targetMonth;

      if (filter === "custom_month" && customMonth) {
        const monthParts = customMonth.split("-");
        targetYear = parseInt(monthParts[0]);
        targetMonth = parseInt(monthParts[1]) - 1;
      } else {
        targetYear = now.getFullYear();
        targetMonth = now.getMonth();
      }

      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const dailyTotals = {};

      for (let i = 1; i <= daysInMonth; i++) {
        const dateKey = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        dailyTotals[dateKey] = 0;
      }

      transaksiFiltered.forEach((tr) => {
        const dateStr = tr.tanggal.toISOString().slice(0, 10);
        if (dailyTotals.hasOwnProperty(dateStr)) {
          dailyTotals[dateStr] += tr.total_harga || 0;
        }
      });

      grafikData = Object.entries(dailyTotals).map(([tanggal, total]) => ({
        tanggal: tanggal.slice(8, 10), // Hanya tampilkan tanggal (01, 02, dst)
        total,
      }));
    } else if (filter === "year" || filter === "custom_year") {
      // Grafik per bulan (12 bulan)
      const monthlyTotals = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

      for (let i = 0; i < 12; i++) {
        monthlyTotals[i] = 0;
      }

      transaksiFiltered.forEach((tr) => {
        const month = tr.tanggal.getMonth();
        monthlyTotals[month] += tr.total_harga || 0;
      });

      grafikData = Object.entries(monthlyTotals).map(([month, total]) => ({
        tanggal: monthNames[parseInt(month)],
        total,
      }));
    }

    return new Response(
      JSON.stringify({
        totalProduk,
        totalOrder,
        totalSales,
        produkTerlaris,
        grafikData,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error admin-metric:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
