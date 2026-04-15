function buildPagination(query) {
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 10);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

module.exports = { buildPagination };
