/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// this file only be executed on run gatsby develop, gatsby build 
//  `node` means a file or something from the content source, 
//  getNode had passed to here from the outter context that execute this `onCreateNode` function


const { createFilePath } = require('gatsby-source-filesystem')
const path = require('path')

const _kababCase = require('lodash.kebabcase')


const _MarkdownRemark = 'MarkdownRemark'

 const getTagsFromPosts = (posts) => {


  const tagsSet = new Set()

  posts.forEach(({node}) => {
      
    if(node.frontmatter.tags){
      const tagsArrOfThisArticle = node.frontmatter.tags

      tagsArrOfThisArticle.forEach(t => tagsSet.add(t))
     
    }

  })

  return tagsSet
};




exports.onCreateNode = ({ node, getNode, actions }) => {
 
  const { createNodeField } = actions

  if(node.internal.type === _MarkdownRemark){
   
    const filePathSlug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name:`slug`,
      value:filePathSlug    // attach additional field to node
    })
  }
}


exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
  
    // Query data with GraphQL 
    graphql(`
      {
        allMarkdownRemark{
          edges {
            node {
              frontmatter {
                tags
              }
              fields {
                slug
              }
            }
          }
        }
      }
    `).then(result => {
      // Map the query results to pages
      const allMarkdownRemark = result.data.allMarkdownRemark
        allMarkdownRemark.edges.forEach(({node}) => {
        createPage({
          path: node.fields.slug,
          component: path.resolve(`./src/templates/blog-post.js`),
          context:{ 
            // Data passed to context is available
            // in page queries as GraphQL variables.
          slug: node.fields.slug,
           }
        })
      })

      const tagsSet = getTagsFromPosts(allMarkdownRemark.edges)

      Array.from(tagsSet).forEach(tag => {

        createPage({
          path: `/tags/${_kababCase(tag)}`,
          component: path.resolve(`./src/templates/tags.js`),
          context:{ 
            // Data passed to context is available
            // in page queries as GraphQL variables.
          tTag: tag,
          allTagsArr: Array.from(tagsSet.values()),
           }
        })

      })

      resolve()
    }) 
  })
}


