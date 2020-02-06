const graphql = require("graphql");
var _ = require("lodash");
const User = require("../model/user");
const Hobby = require("../model/hobby");
const Post = require("../model/post");

//dummy data
// var usersData = [
//     { id: "1", name: "Bond", age: 36, job: "mayor" },
//     { id: "2", name: "Anna", age: 26, job: "barista" },
//     { id: "3", name: "Julie", age: 16, job: "student" },
//     { id: "4", name: "Gina", age: 25, job: "waitress" },
//     { id: "5", name: "Georgina", age: 52, job: "libraian" },
//     { id: "6", name: "Hank", age: 76, job: "retired" },
//     { id: "7", name: "Paublo", age: 45, job: "musician" },
//     { id: "8", name: "Oscar", age: 40, job: "engineer" }
// ];
// var hobbyData = [
//     { id: "1", title: "sleeping", description: "renewing energy", userId: "1" },
//     { id: "2", title: "eating", description: "fueling up", userId: "2" },
//     {
//         id: "3",
//         title: "working",
//         description: "expending energy",
//         userId: "2"
//     },
//     { id: "4", title: "exercise", description: "little of both", userId: "4" }
// ];
// var postData = [
//     { id: "1", comment: "how long will this take", userId: "2" },
//     { id: "2", comment: "what will I get from this", userId: "3" },
//     { id: "3", comment: "okay, faster, please.", userId: "2" }
// ];
const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;
// create types
const UserType = new GraphQLObjectType({
    name: "User",
    description: "Documentation for User",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        job: { type: GraphQLString },
        posts: {
            type: GraphQLList(PostType),
            resolve(parent, args) {
                return Post.find({ userId: args.id });
            }
        },
        hobbies: {
            type: GraphQLList(HobbyType),
            resolve(parent, args) {
                return Hobby.find({});
            }
        }
    })
});
const HobbyType = new GraphQLObjectType({
    name: "Hobby",
    description: "Hobby description",
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userId);
            }
        }
    })
});

const PostType = new GraphQLObjectType({
    name: "Post",
    description: "Post description",
    fields: () => ({
        id: { type: GraphQLID },
        comment: { type: GraphQLString },
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userId);
            }
        }
    })
});

//Rootquery
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    description: "Description of",
    fields: {
        user: {
            type: UserType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return User.findById(args.id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },
        hobby: {
            type: HobbyType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return Hobby.findById(args.id);
            }
        },
        hobbies: {
            type: new GraphQLList(HobbyType),
            resolve(parent, args) {
                return Hobby.find({});
            }
        },
        post: {
            type: PostType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return Post.findById(args.id);
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                return User.find({});
            }
        }
    }
});

//===================================
// mutations
//-----------------------------------
const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        CreateUser: {
            type: UserType,
            args: {
                // id: {type: GraphQLID},
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                job: { type: GraphQLString }
            },
            resolve(parent, args) {
                let user = new User({
                    name: args.name,
                    age: args.age,
                    job: args.job
                });
                //save to Mongoose database using mongoose schema model/user.js
                return user.save();
            }
        },
        UpdateUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: GraphQLString },
                age: { type: GraphQLInt },
                job: { type: GraphQLString }
            },
            resolve(parent, args) {
                return (updatedUser = User.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            age: args.age,
                            job: args.job
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
            }
        },
        DeleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                let deletedUser = User.findByIdAndDelete(args.id).exec();

                if (!deletedUser) {
                    throw new "DeleteUser call failed"();
                }
            }
        },
        CreatePost: {
            type: PostType,
            args: {
                // id: { type: GraphQLID },
                comment: { type: new GraphQLNonNull(GraphQLString) },
                userId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                let post = new Post({
                    comment: args.comment,
                    userId: args.userId
                });
                return post.save();
            }
        },
        UpdatePost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                comment: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                return (updatedPost = Post.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            comment: args.comment
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
            }
        },
        DeletePost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                let deletePost = User.findByIdAndDelete(args.id).exec();

                if (!deletePost) {
                    throw new "DeletePost call failed"();
                }
            }
        },
        CreateHobby: {
            type: HobbyType,
            args: {
                // id: { type: GraphQLID},
                title: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                userId: { type: GraphQLID }
            },
            resolve(parent, args) {
                let hobby = new Hobby({
                    title: args.title,
                    description: args.description,
                    userId: args.userId
                });
                return hobby.save();
            }
        },
        UpdateHobby: {
            type: HobbyType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                title: { type: GraphQLString },
                description: { type: GraphQLString },
                userId: { type: GraphQLID }
            },
            resolve(parent, args) {
                return (updatedHobby = Hobby.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            title: args.title,
                            description: args.description
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
            }
        },
        DeleteHobby: {
            type: HobbyType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                let deleteHobby = User.findByIdAndDelete(args.id).exec();

                if (!deleteHobby) {
                    throw new "DeleteHobby call failed"();
                }
            }
        }
    }
});
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
