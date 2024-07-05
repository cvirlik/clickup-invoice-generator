import { shortenString } from './utils.js';
import type { PDF } from './pdf.js';
import type { Task } from './api.js';

export type Header = {
  name: string;
  address: string;
  country: string;
  postalCode: string;
  ICO?: string;
  DIC?: string;
};

export type RenderHeadersArgs = {
  pdf: PDF;
  from: Header;
  to: Header;
};

function renderHeader(pdf: PDF, header: Header) {
  pdf.bulkWrite('vertical', [
    { type: 'header', text: header.name },
    { type: 'subHeader', text: header.address },
    { text: header.country },
    { text: header.postalCode },
    { text: header.ICO ? `ICO: ${header.ICO}` : null },
    { text: header.DIC ? `DIC: ${header.DIC}` : null },
  ]);
}

export function renderHeaders(args: RenderHeadersArgs) {
  const { pdf, from, to } = args;

  renderHeader(pdf, from);

  const firstColumnCursor = pdf.cursor;
  pdf.cursorTo(pdf.width / 2, 0);

  renderHeader(pdf, to);

  pdf.cursor = firstColumnCursor;
  pdf.newLine(3);
}

export type RenderTasksArgs = {
  pdf: PDF;
  tasks: Record<string, Task>;
};

export function renderTasks(args: RenderTasksArgs): number {
  const { pdf, tasks } = args;

  const tasksCursor = pdf.cursor;
  for (const [id, task] of Object.entries(tasks)) {
    pdf.write({
      text: `[${id}] ${shortenString(task.name, 40)}`,
      direction: 'vertical',
      url: `https://app.clickup.com/t/${id}`,
    });
  }

  pdf.cursorTo(pdf.width - 180, tasksCursor.y, true);

  for (const task of Object.values(tasks)) {
    const time = Number((task.time / 1000 / 60 / 60).toFixed(2));

    pdf.write({
      text: `${time}h`,
      direction: 'vertical',
    });
  }

  pdf.cursorTo(pdf.width - 100, tasksCursor.y, true);

  let total = 0;
  for (const task of Object.values(tasks)) {
    const time = Number((task.time / 1000 / 60 / 60).toFixed(2));
    total += time * 500;

    pdf.write({
      text: `${time * 500} CZK`,
      direction: 'vertical',
    });
  }

  pdf.cursorTo(pdf.width - 180, pdf.cursor.y, true);
  pdf.newLine(3);

  return total;
}

export type RenderTotalArgs = {
  pdf: PDF;
  total: number;
};

export function renderTotal(args: RenderTotalArgs) {
  const { pdf, total } = args;

  pdf.write({
    type: 'subHeader',
    text: `Total: ${total} CZK`,
    direction: 'vertical',
  });
}

export type RenderPromoArgs = { pdf: PDF };

export function renderPromo(args: RenderPromoArgs) {
  const { pdf } = args;

  pdf.cursorTo(0, pdf.height - 50);
  pdf.write({
    text: `Powered by Artem Prokop`,
    url: 'https://github.com/ExposedCat',
  });
}