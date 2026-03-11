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

const readJsonFile = (filename, defaultVal = {}) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
        return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return defaultVal;
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

/**
 * Special store for userActivity.json which is a map:
 *   { [userId]: { wishlisted: [], listed: [], sold: [], orderHistory: [] } }
 */
const createActivityStore = () => ({
    FILENAME: 'userActivity.json',

    _BLANK_ENTRY: () => ({ wishlisted: [], listed: [], sold: [], orderHistory: [], img: null }),

    _read() {
        return readJsonFile(this.FILENAME, {});
    },

    _write(data) {
        writeData(this.FILENAME, data);
    },

    /** Get (or auto-create) the activity record for a user */
    getOrCreate(userId) {
        const all = this._read();
        if (!all[userId]) {
            all[userId] = this._BLANK_ENTRY();
            this._write(all);
        }
        return all[userId];
    },

    /** Ensure every user in users.json has an activity entry */
    ensureAll(userIds) {
        const all = this._read();
        let changed = false;
        userIds.forEach(id => {
            if (!all[id]) {
                all[id] = this._BLANK_ENTRY();
                changed = true;
            }
        });
        if (changed) this._write(all);
    },

    /** Update specific fields of a user's activity record */
    update(userId, patch) {
        const all = this._read();
        if (!all[userId]) all[userId] = this._BLANK_ENTRY();
        all[userId] = { ...all[userId], ...patch };
        this._write(all);
        return all[userId];
    },

    /** Remove a productId from every user's array in a given list name ('wishlisted', 'listed', 'sold', 'orderHistory') */
    removeProductFromAll(listName, productId) {
        const all = this._read();
        Object.keys(all).forEach(uid => {
            if (Array.isArray(all[uid][listName])) {
                all[uid][listName] = all[uid][listName].filter(id => id !== productId);
            }
        });
        this._write(all);
    },

    getAll() {
        return this._read();
    }
});

const jsonDb = {
    users:        createCollection('users.json'),
    admins:       createCollection('admins.json'),
    products:     createCollection('products.json'),
    userActivity: createActivityStore()
};

module.exports = jsonDb;
