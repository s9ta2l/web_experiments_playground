export function createControlPanel(p, mountId, title = "Controls") {
  const panel = p.createDiv();
  panel.parent(mountId);
  panel.addClass("control-panel");

  if (title) {
    const heading = p.createDiv(title);
    heading.parent(panel);
    heading.addClass("control-panel__heading");
  }

  return panel;
}

export function addSliderControl(
  p,
  panel,
  { label, min, max, value, step, format = defaultFormat }
) {
  const field = createField(p, panel);
  const header = p.createDiv();
  header.parent(field);
  header.addClass("control-field__header");

  const labelEl = p.createDiv(label);
  labelEl.parent(header);
  labelEl.addClass("control-label");

  const valueEl = p.createDiv(format(value));
  valueEl.parent(header);
  valueEl.addClass("control-value");

  const slider = p.createSlider(min, max, value, step);
  slider.parent(field);
  slider.addClass("control-range");

  const sync = () => {
    valueEl.html(format(slider.value()));
  };

  slider.input(sync);
  sync();

  return { field, slider, valueEl, sync };
}

export function addStatControl(p, panel, { label, value }) {
  const field = createField(p, panel);
  const header = p.createDiv();
  header.parent(field);
  header.addClass("control-field__header");

  const labelEl = p.createDiv(label);
  labelEl.parent(header);
  labelEl.addClass("control-label");

  const valueEl = p.createDiv(value);
  valueEl.parent(header);
  valueEl.addClass("control-value");

  return { field, labelEl, valueEl };
}

export function addCheckboxControl(p, panel, { label, checked }) {
  const field = createField(p, panel);
  const checkbox = p.createCheckbox(label, checked);
  checkbox.parent(field);
  checkbox.addClass("control-checkbox");
  return checkbox;
}

export function addButtonRow(p, panel) {
  const row = p.createDiv();
  row.parent(panel);
  row.addClass("control-button-row");
  return row;
}

export function addButton(p, parent, label, onPress, variant = "default") {
  const button = p.createButton(label);
  button.parent(parent);
  button.addClass("control-button");

  if (variant !== "default") {
    button.addClass(`control-button--${variant}`);
  }

  button.mousePressed(onPress);
  return button;
}

export function addDivider(p, panel) {
  const divider = p.createDiv("");
  divider.parent(panel);
  divider.addClass("control-divider");
  return divider;
}

function createField(p, panel) {
  const field = p.createDiv();
  field.parent(panel);
  field.addClass("control-field");
  return field;
}

function defaultFormat(value) {
  return String(value);
}
