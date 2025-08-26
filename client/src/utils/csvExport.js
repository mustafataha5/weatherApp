// src/utils/csvExport.js
export const exportToCSV = (data, filename = "weather_history.csv") => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // header row first
    ...data.map(row =>
      headers.map(field => JSON.stringify(row[field] ?? "")).join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};