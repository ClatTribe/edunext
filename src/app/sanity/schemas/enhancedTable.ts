import { defineType } from 'sanity';

export default defineType({
  name: 'enhancedTable',
  title: 'Table',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Table Title (optional)',
      type: 'string',
    },
    {
      name: 'rows',
      title: 'Table Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'isHeader',
              title: 'Is Header Row?',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              cells: 'cells',
              isHeader: 'isHeader',
            },
            prepare({ cells, isHeader }: { cells?: string[]; isHeader?: boolean }) {
              return {
                title: cells?.join(' | ') || 'Empty row',
                subtitle: isHeader ? 'Header Row' : 'Data Row',
              };
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      rows: 'rows',
    },
    prepare({ title, rows }: { title?: string; rows?: any[] }) {
      return {
        title: title || 'Table',
        subtitle: `${rows?.length || 0} rows`,
      };
    },
  },
});