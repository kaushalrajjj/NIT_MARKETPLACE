const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

const readData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeData = (filename, data) => {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const createCollection = (filename) => ({
    find: (query = {}) => {
        let items = readData(filename);
        if (Object.keys(query).length > 0) {
            items = items.filter(item => {
                return Object.keys(query).every(key => {
                    if (key === '$or' && Array.isArray(query[key])) {
                        return query[key].some(subQuery =>
                            Object.keys(subQuery).every(subKey => item[subKey] === subQuery[subKey])
                        );
                    }
                    return item[key] === query[key];
                });
            });
        }
        return items;
    },
    findOne: (query) => {
        const items = readData(filename);
        return items.find(item => Object.keys(query).every(key => item[key] === query[key]));
    },
    findById: (id) => {
        const items = readData(filename);
        return items.find(item => item._id === id);
    },
    create: (data) => {
        const items = readData(filename);
        const newItem = {
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            ...data,
            createdAt: new Date().toISOString()
        };
        items.push(newItem);
        writeData(filename, items);
        return newItem;
    },
    update: (id, update) => {
        const items = readData(filename);
        const index = items.findIndex(item => item._id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...update, updatedAt: new Date().toISOString() };
            writeData(filename, items);
            return items[index];
        }
        return null;
    },
    delete: (id) => {
        let items = readData(filename);
        items = items.filter(item => item._id !== id);
        writeData(filename, items);
    }
});

const jsonDb = {
    users: createCollection('users.json'),
    products: createCollection('products.json'),
    notifications: createCollection('notifications.json')
};

module.exports = jsonDb;
