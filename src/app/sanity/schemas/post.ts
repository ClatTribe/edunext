import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    // This is the main content area where you will paste from Word
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block', // Standard paragraphs, H1-H6, lists, bold/italics
          styles: [{title: 'Normal', value: 'normal'}, {title: 'H2', value: 'h2'}],
          lists: [{title: 'Bullet', value: 'bullet'}, {title: 'Numbered', value: 'number'}],
          marks: {
            decorators: [{title: 'Strong', value: 'strong'}, {title: 'Emphasis', value: 'em'}],
            annotations: [{title: 'URL', name: 'link', type: 'object', fields: [{type: 'url', name: 'href'}]}],
          },
        },
        {
          type: 'table', // <-- This adds the ability to insert tables
        },
      ],
    }),
  ],
});