/**
 * Mongoose schema for User model.
 * @typedef {Object} UserSchema
 * @property {String} name - Name of the user (required)
 * @property {String} email - Email of the user (required)
 * @property {Date} createdAt - Timestamp when the user was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when the user was last updated (auto-generated)
 */

/**
 * User model for MongoDB database.
 * @type {mongoose.Model<UserSchema>}
 * @exports User
 */

import mongoose from 'mongoose'
const Schema = mongoose.Schema

const userSchema = new Schema({
  name:
      {
        type: String,
        required: [true, 'User name is required'],
        unique: false
      },
  email:
      {
        type: String,
        required: [true, 'User email is required'],
        unique: false
      }
}, { timestamps: true } )

export const User = mongoose.model('User', userSchema)
