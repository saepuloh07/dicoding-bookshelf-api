const { nanoid } = require('nanoid');
const books = require('./books');

const transformResponse = (h, statusCode, message, data) => {
  if (statusCode === 200 || statusCode === 201) {
    const template = {
      status: 'success',
      message,
      data,
    }

    if (!message) {
      delete template.message;
    }

    if (!data) {
      delete template.data;
    }
      
    return h.response(template).code(statusCode);
  }

  return h.response({
    status: (statusCode === 500) ? 'error' : 'fail',
    message,
  }).code(statusCode);
}

const createBookHandler = (request, h) => {
  let { name = '', year = 0, author = '', summary = '', publisher = '', pageCount = 0, readPage = 0, reading = false, finished = false } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  if (!name) {
    return transformResponse(h, 400, 'Gagal menambahkan buku. Mohon isi nama buku', null)
  }

  if (readPage > pageCount) {
    return transformResponse(h, 400, 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount', null)
  } else if (readPage == pageCount) {
    finished = true;
  }

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, reading, finished ,insertedAt, updatedAt,
  };
  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    return transformResponse(h, 201, 'Buku berhasil ditambahkan', { bookId: id })
  }
  return transformResponse(h, 500, 'Buku gagal ditambahkan', null)
};

const getAllBookHandler = (request, h) => {
  let { name = '', reading = '', finished = '' } = request.query;

  const nameToRegex = new RegExp(name.toLowerCase());
  let arrBooks = books.filter((book) => {
    reading = (reading === '1') ? true : (reading === '0') ? false : '';
    finished = (finished === '1') ? true : (finished === '0') ? false : '';
    
    if (reading !== '' && book.reading !== reading) return false;
    if (finished !== '' && book.finished !== finished) return false;
    if (name !== '' && !nameToRegex.test(book.name.toLowerCase())) return false;

    return true;
  }).map((book) => ({
    "id": book.id,
    "name": book.name,
    "publisher": book.publisher
  }))
  
  return transformResponse(h, 200, null, { books: arrBooks })
}

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];
  if (book !== undefined) {
    return transformResponse(h, 200, null, { book });
  }
  return transformResponse(h, 404, 'Buku tidak ditemukan', null);
}

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  let { name = '', year = 0, author = '', summary = '', publisher = '', pageCount = 0, readPage = 0, reading = false, finished = false } = request.payload;
  const updatedAt = new Date().toISOString();

  if (name === '') {
    return transformResponse(h, 400, 'Gagal memperbarui buku. Mohon isi nama buku', null)
  }

  if (readPage > pageCount) {
    return transformResponse(h, 400, 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount', null)
  } else if (readPage == pageCount) {
    finished = true;
  }

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year, 
      author, 
      summary, 
      publisher, 
      pageCount, 
      readPage, 
      reading,
      finished,
      updatedAt,
    };

    return transformResponse(h, 200, 'Buku berhasil diperbarui', null);
  }
  return transformResponse(h, 404, 'Gagal memperbarui buku. Id tidak ditemukan', null);
}

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);

    return transformResponse(h, 200, 'Buku berhasil dihapus', null);
  }

  return transformResponse(h, 404, 'Buku gagal dihapus. Id tidak ditemukan', null);
};

module.exports = { createBookHandler, getAllBookHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler };