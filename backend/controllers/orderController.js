const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
    try {
        const { books, totalPrice, address } = req.body;
        
        if (!books || books.length === 0) {
            return res.status(400).send({ error: 'Order must contain at least one book.' });
        }
        
        if (!address ||
            !address.flat ||
            !address.street ||
            !address.city ||
            !address.district ||
            !address.state ||
            !address.pincode
        ) {
            return res.status(400).send({ error: 'Invalid address' });
        }

        // Check for any invalid quantities
        const hasInvalidQty = books.some(item => item.quantity <= 0);
        if (hasInvalidQty) {
            return res.status(400).send({ error: 'All books must have a quantity of at least 1.' });
        }

        // Fetch current book prices and calculate actual total
        const Book = require('../models/Book');
        let calculatedTotalPrice = 0;
        const bookDetails = await Promise.all(books.map(async (item) => {
            const book = await Book.findById(item.bookId);
            if (!book) throw new Error(`Book not found: ${item.bookId}`);
            if (book.stock < item.quantity) throw new Error(`Not enough stock for ${book.title}`);
            
            const itemPrice = book.price;
            calculatedTotalPrice += itemPrice * item.quantity;
            
            return {
                bookId: item.bookId,
                quantity: item.quantity,
                price: itemPrice
            };
        }));

        const order = new Order({
            userId: req.user._id,
            books: bookDetails,
            totalPrice: calculatedTotalPrice,
            address
        });
        await order.save();
        console.log("Order request received:", req.body);

        // Update stock
        await Promise.all(books.map(async (item) => {
            await Book.findByIdAndUpdate(item.bookId, { $inc: { stock: -item.quantity } });
        }));

        // Clear cart after order
        await Cart.findOneAndDelete({ userId: req.user._id });
        res.status(201).send(order);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).populate('books.bookId').sort({ createdAt: -1 });
        res.send(orders);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').populate('books.bookId').sort({ createdAt: -1 });
        res.send(orders);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).send({ error: 'Invalid order status' });
        }
        
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) return res.status(404).send({ error: 'Order not found' });
        res.send(order);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};
