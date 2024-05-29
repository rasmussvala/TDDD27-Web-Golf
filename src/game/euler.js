export function eulerApproximation(F, v0, x0, m, h) {
  let v1 = v0.clone();
  let x1 = x0.clone();

  v1.add(F.multiplyScalar(h / m));
  x1.add(v1.clone().multiplyScalar(h));

  return [v1, x1];
}
