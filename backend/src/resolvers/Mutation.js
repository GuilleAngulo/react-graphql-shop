const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { hasPermission } = require('../utils');
const {transport, makeANiceEmail } = require('../mail');
const stripe = require('../stripe');

const Mutations = {

    async createItem(parent, args, ctx, info) {
        //1. Check if they are logged in
        if (!ctx.request.userId) {
            throw new Error('You must be logged to do that!');
        }
        console.log(ctx.request.userId);
        const item = await ctx.db.mutation.createItem({
            data: {
                // This is how to create a relationship between the Item and the User
                user: {
                  connect: {
                    id: ctx.request.userId,
                  },
                },
                ...args,
              },
            },
            info);
    
        return item;
    },
    updateItem(parent, args, ctx, info) {
        //First take a copy of updates
        const updates = { ...args};
        //Remove the id from the updates
        delete updates.id;
        //Run the update method
        return ctx.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            },
        }, 
        info
        );
    },

    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id };
        //1. Find the item
        const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);
        //2. Check if they own that item, or have the permissions
        const ownsItem = item.user.id === ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions
                                    .some(permission => ['ADMIN','ITEMDELETE']
                                    .includes(permission));
        if(!ownsItem && !hasPermissions) {
            throw new Error("You don´t have permission to do that!");
        }

        //3. Delete it!
        return ctx.db.mutation.deleteItem({ where }, info);
    },
    async signup(parent, args, ctx, info) {
        //Lowercase user email (in case is written uppercase)
        args.email = args.email.toLowerCase();
        //Hash user password
        const password = await bcrypt.hash(args.password, 10);
        //Check email unique constraint, if another user is using same email
        if (await ctx.db.query.user({ where: { email: args.email } })) {
            throw new Error(`Email ${args.email} is already in use.`);
        }
        //Create the user in the database
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password,
                permissions: { set: ['USER'] },
            },
        }, info);

        //Create the JW token for the user
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        
        //Set the JWT as a cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true, //Not accessible by JS
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 Year Cookie
        });

        //Return user to the browser
        return user;
    },

    async signin(parent, { email, password }, ctx, info) {
        //1. Check if there is a user with that email
        const user = await ctx.db.query.user({ where: { email }});
        if (!user) {
            throw new Error(`No such user found for email ${email}`);
        }

        //2. Check if their password is correct
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error('Invalid password');
        }

        //3. Generate the JWT Token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        
        //4. Set the cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true, //Not accessible by JS
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 Year Cookie
        });
        
        //5. Return the user
        return user;
    },

    signout(parent, args, ctx, info) {
        ctx.response.clearCookie('token');
        return { message: 'Goodbye! '};
    },

    async requestReset(parent, args, ctx, info) {
        //1. Check if is a real user
        const user = await ctx.db.query.user({ where: { email: args.email } });
        if (!user) {
            throw new Error(`No such user found for email ${args.email}`);
        }
        //2. Set a reset token and expiry on that user
        const randomBytesPromisified = promisify(randomBytes);
        const resetToken = (await randomBytesPromisified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000 //1 hour from now
        const res = await ctx.db.mutation.updateUser({
            where: { email: args.email },
            data: { resetToken, resetTokenExpiry }
        });

        //3. Email them that reset token
        try { await transport.sendMail({
                from: 'anyermo@gmail.com',
                to: user.email,
                subject: 'Your Password Reset',
                html: makeANiceEmail(`Your password reset Token is here! 
                \n \n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to Reset</a>`)
             });
        } catch (error) {
            console.log(error);
            throw new Error('Something went wrong sending your email. Try again.');
        } finally {
            //4. Return the message
            return { message: 'Thanks' };
        }
    },

    async resetPassword(parent, args, ctx, info) {
        //1. Check if the passwords match
        if (args.password !== args.confirmPassword) {
            throw new Error('Your passwords don´t match.');
        }
        //2. Check if its a legit reset token
        //3. Check if its expired
        const [user] = await ctx.db.query.users({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000
            }
        });
        if (!user) {
            throw new Error('This token is either invalid or expired');
        }

        //4. Hash the new password
        const password = await bcrypt.hash(args.password, 10);
        //5. Save the new password to the user and remove old resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password, 
                resetToken: null, 
                resetTokenExpiry: null
            },
        });
        //6. Generate JWT
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        //7. Set the JWT cookie
        ctx.response.cookie('token', token, {
            httpOnly: true, //Not accessible by JS
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 Year Cookie
        });
        //8. Return the new user
        return updatedUser;
    },

    async updatePermissions(parent, args, ctx, info) {
        //1. Check if is logged in
        if (!ctx.request.userId) {
            throw new Error('You must be logged to do that!');
        }
        //2. Query the current user
        const currentUser = await ctx.db.query.user({
            where: {
                id: ctx.request.userId,
            },
        }, info);
        //3. Check if haves permissions to do this
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        //4. Update the permissions
        return ctx.db.mutation.updateUser({
            data: {
                permissions: {
                    //Needs set because is a schema enum
                    set: args.permissions,
                }
            },
            where: {
                id: args.userId
            }
        }, info);
    },

    async addToCart(parent, args, ctx, info) {
        //1. Make sure user is logged in
        const { userId } = ctx.request;
        if (!userId) {
            throw new Error('You must be logged to do that!');
        }
        //2. Query the users current cart
        const [existingCartItem] = await ctx.db.query.cartItems({
            where: {
                user: { id: userId },
                item: { id: args.id },
            }
        });
        //3. Check if the item is already in their cart 
        //3.1 Increment by 1 if it is
        if (existingCartItem) {
            return ctx.db.mutation.updateCartItem({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + 1 }
            }, info);
        }
        //4.  If its not, create a fresh cartItem for that user!
        return ctx.db.mutation.createCartItem({
            data: {
                user: {
                    connect: { id: userId },
                }, 
                item: {
                    connect: { id: args.id },
                },
            }
        }, info);
    },

    async removeFromCart(parent, args, ctx, info) {
        const { userId } = ctx.request;
        if (!userId) {
            throw new Error('You must be logged to do that!');
        }
        //1. Find the cart item
        const cartItem = await ctx.db.query.cartItem({
            where: {
                id: args.id,
            },
        }, `{ id, user { id } }`);

        //Make sure that the cartItem exists
        if (!cartItem) {
            throw new Error('No cart item found');
        }

        //2. Make sure they own that cart item
        if (cartItem.user.id !== userId) {
            throw new Error('You are not the owner of the cart!');
        }

        //3. Delete that cart item
        return ctx.db.mutation.deleteCartItem({
            where: { id: args.id },
        }, info);
    },

    async createOrder(parent, args, ctx, info) {
        //1. Query current user and make sure they are signed in
        const { userId } = ctx.request;
        if (!userId) {
            throw new Error('You must be signed in to complete this order.');
        }
        const user = await ctx.db.query.user({
            where: { id: userId }
        }, `
        {
            id 
            name 
            email 
            cart { 
                id 
                quantity 
                item { 
                    id 
                    title 
                    price 
                    description 
                    image
                    largeImage
                }
            }
        }`
        );

        //2. Recalculate the total for the price
        const amount = user.cart.reduce((tally, cartItem) => 
            tally + cartItem.item.price * cartItem.quantity, 0);

        console.log(`Going to charge for a total of ${amount}`);

        //3. Create the stripe charge (turn token into $$$)
        const charge = await stripe.charges.create({
            amount,
            currency: process.env.CURRENCY,
            //TODO - description:
            source: args.token,
        });

        //4. Convert the cartItems to orderItems

        const orderItems = user.cart.map(cartItem => {
            const orderItem = {
                //Is not a realtionship, but a copy. An Item can change its price
                //be removed, and is neccessary to keep the orderItem invariable
                ...cartItem.item,
                quantity: cartItem.quantity,
                user: { connect: { id: userId }},
            };
            delete orderItem.id;
            return orderItem;
        });

        //5. Create the order
        const order = await ctx.db.mutation.createOrder({
            data: {
                total: charge.amount,
                charge: charge.id,
                items: { create: orderItems },
                user: { connect: { id: userId} },
            }
        }).catch(err => {
            console.log(err.message);
            throw new Error('Oops. Something went wrong in your order.');
        });

        //6. Clean up - clear users cart, delete cartItems
        const cartItemIds = user.cart.map(cartItem => cartItem.id);

        await ctx.db.mutation.deleteManyCartItems({ 
            where: {
                id_in: cartItemIds
            }
        });

        //7. Return the order to the client
        return order;
    },
    async updateUser(parent, args, ctx, info) {
        //1. Query current user and make sure they are signed in
        const { userId } = ctx.request;
        if (!userId) {
            throw new Error('You must be signed in to update your account.');
        }

        const user = await ctx.db.query.user({
            where: { id: userId }
        }, `
        {
            email
            password
        }
        `);

        //2. Check if their password is correct
        const valid = await bcrypt.compare(args.password, user.password);
        if (!valid) {
            throw new Error('Your password is incorrect. Type your actual password');
        }

        //3. Check if is trying to change the email
        if (user.email !== args.email) {
        //4. Check if the new email is unique
            if (await ctx.db.query.user({ where: { email: args.email } })) {
                throw new Error(`Email ${args.email} is already in use. Try another one.`);
            }
        }

        //5. Take a copy of the arguments
        const updates = { ...args};

        //6. Remove the id and password from the updates
        delete updates.id;
        delete updates.password;

        //7. Run the update method
        return ctx.db.mutation.updateUser({
            data: updates,
            where: {
                id: args.id,
            },
        }, 
        info
        );
    },

};

module.exports = Mutations;
