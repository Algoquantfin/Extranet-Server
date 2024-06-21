const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}${mm}${yy}`;
  };
  
  const subtractDayFromDate = (date) => {
    const yesterday = new Date(date);
    yesterday.setDate(date.getDate() - 1);
    return yesterday;
  };
  
  module.exports = { formatDate, subtractDayFromDate };
  