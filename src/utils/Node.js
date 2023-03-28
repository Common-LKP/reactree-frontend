/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from "uuid";

function Node() {
  this.name = "";
  this.props = [];
  this.state = [];
  this.reduxState = [];
  this.uuid = uuidv4();
  this.children = [];
}

const pushState = function (memoizedState, stateArray, reduxStateArray) {
  if (memoizedState === null) return;

  if (memoizedState.baseState) {
    stateArray.push(JSON.stringify(memoizedState.baseState));
  }

  if (memoizedState.queue?.value) {
    reduxStateArray.push(JSON.stringify(memoizedState.queue.value, null, 2));
  }

  pushState(memoizedState.next, stateArray, reduxStateArray);
};

Node.prototype.addChild = function (child) {
  this.children.push(child);
};

Node.prototype.setName = function (node) {
  this.tag = node.tag;

  if (node.tag === 0) {
    this.name = node.elementType.name;
  } else if (node.tag === 3) {
    this.name = "root";
  } else if (node.tag === 6) {
    this.name = node.memoizedProps;
  } else if (node.tag === 8) {
    this.name = "React.StrictMode";
  } else if (node.tag === 10) {
    this.name = node.elementType.name;
  } else if (node.tag === 11) {
    if (node.child.elementType === "a") {
      this.name = "Link";
    } else if (node.child.tag === 5) {
      this.name = "Styled component";
    }
  } else if (node.tag === 15) {
    this.name = "SimpleMemoComponent";
  } else {
    this.name = node.elementType;
  }
};

Node.prototype.addProps = function (node) {
  if (!node.memoizedProps) return;

  if (node.tag === 0 || node.tag === 1) {
    Object.values(node.memoizedProps).forEach(item => this.props.push(item));
  }

  if (node.tag === 11 && node.child.elementType === "a") {
    const linkHref = node.memoizedProps.to;
    this.props.push(`to "${linkHref}"`);
  }
};

Node.prototype.addState = function (node) {
  if (!node.memoizedState) return;

  if (node.tag === 0 || node.tag === 1) {
    pushState(node.memoizedState, this.state, this.reduxState);
  }
};

export default Node;
