import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material';
import { Composite } from '../composite';
import { ITreeOptions, TreeComponent } from 'angular-tree-component';
import { DashboardOverviewEditSearchmaskComponent } from './dashboard-overview-edit-searchmask/dashboard-overview-edit-searchmask.component';
import { isNullOrUndefined } from '../../../../utils/misc';
import { QuestionModalComponent } from '../../../question-modal/question-modal.component';
import { createNoAction, createYesAction } from '../../../question-modal/question-modal-utils';
import * as clone from 'clone';

interface Node {
  readonly id?: number;
  readonly name: string;
  readonly composite: Composite;
  children?: Array<Node>;
}

@Component({
  selector: 'app-dashboard-overview-edit-modal',
  templateUrl: './dashboard-overview-edit-modal.component.html',
  styleUrls: [ './dashboard-overview-edit-modal.component.scss' ],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardOverviewEditModalComponent implements OnInit {
  @ViewChild(TreeComponent) private _tree: TreeComponent;

  private readonly _composites: Array<Composite>;

  private readonly _nodes: Array<Node>;
  public get nodes (): Array<Node> {
    return this._nodes;
  }

  // https://angular2-tree.readme.io/docs/options-2
  public get options (): ITreeOptions {
    return {
      allowDrag: true,
      allowDrop: true,
      animateExpand: true,
      animateSpeed: 10,
      animateAcceleration: 1.2
    };
  }

  public constructor (private _dialogRef: MatDialogRef<DashboardOverviewEditModalComponent>,
                      @Inject(MAT_DIALOG_DATA) composites: Array<Composite>,
                      private _dialog: MatDialog) {
    this._composites = clone(composites);
    this._nodes = this.transformComposites(this._composites);
  }

  public ngOnInit () {
  }

  private transformComposites (composites: Array<Composite>): Array<Node> {
    return composites.map(composite => {
      const hasChildren = !Array.isEmptyNullOrUndefined(composite.composites);
      return {
        name: composite.item.name,
        composite: composite,
        children: hasChildren ? this.transformComposites(composite.composites) : undefined
      };
    });
  }

  private getNodeWithComposite (composite: Composite, nodes?: Array<Node>): Node {
    if (isNullOrUndefined(nodes)) {
      nodes = this._nodes;
    }

    const i = nodes.findIndex(node => node.composite === composite);
    if (i >= 0) {
      return nodes[ i ];
    } else {
      for (const node of nodes) {
        const children = node.children;
        if (Array.isEmptyNullOrUndefined(children)) {
          continue;
        }

        const result = this.getNodeWithComposite(composite, children);
        if (!isNullOrUndefined(result)) {
          return result;
        }
      }
    }

    return undefined;
  }

  private getNodeWithCompositeChild (target: Composite, searchComposite?: Composite): Composite {
    if (isNullOrUndefined(searchComposite) || isNullOrUndefined(searchComposite.composites)) {
      return undefined;
    }

    if (searchComposite.composites.some(value => value === target)) {
      return searchComposite;
    }

    for (const c of searchComposite.composites) {
      const result = this.getNodeWithCompositeChild(target, c);
      if (!isNullOrUndefined(result)) {
        return result;
      }
    }

    return undefined;
  }

  public hasChildren (composite: Composite): boolean {
    return !Array.isEmptyNullOrUndefined(composite.composites);
  }

  public addComposite (composite: Composite): void {
    const dialogRef = this._dialog.open(DashboardOverviewEditSearchmaskComponent);
    dialogRef
      .afterClosed()
      .subscribe(value => {
        if (isNullOrUndefined(value)) {
          return;
        }

        let targetArray: Array<Node>;
        let targetCompositeArray: Array<Composite>;

        if (isNullOrUndefined(composite)) {
          targetArray = this._nodes;
          targetCompositeArray = this._composites;
        } else {
          const node = this.getNodeWithComposite(composite);
          if (isNullOrUndefined(node)) {
            // hmmmmmm, why does that composite not exist in the tree?
            return;
          }

          if (isNullOrUndefined(node.children)) {
            node.children = [];
          }

          targetArray = node.children;
          targetCompositeArray = composite.composites;
        }

        targetArray.push({
          name: value.item.name,
          composite: value
        });
        targetCompositeArray.push(value);

        this._tree.treeModel.update();
        const compositeNode = this.getNodeWithComposite(composite);
        if (!isNullOrUndefined(compositeNode)) {
          this._tree.treeModel.getNodeById(compositeNode.id).expand();
        }
      });
  }

  public editComposite (composite: Composite): void {
    const dialogRef = this._dialog.open(DashboardOverviewEditSearchmaskComponent, {
      data: composite
    });

    dialogRef
      .afterClosed()
      .subscribe(value => {
        Object.assign(composite, value);
      });
  }

  public deleteComposite (composite: Composite): void {
    this._dialog.open(QuestionModalComponent, {
      data: {
        actions: [
          createYesAction(() => {
            const deleteFn = (composites: Array<Composite>, nodes: Array<Node>) => {
              const i = nodes.findIndex(value => value.composite === composite);
              if (i >= 0) {
                nodes.removeAt(i);
                composites.removeWhere(value => value === composite);
              } else {
                nodes.forEach(node => {
                  if (!isNullOrUndefined(node.children)) {
                    deleteFn(node.composite.composites, node.children);
                  }
                });
              }
            };

            deleteFn(this._composites, this._nodes);
            this._tree.treeModel.update();
          }),
          createNoAction()
        ],
        title: 'Delete?',
        text: `Do you really want to delete ${composite.item.name}?`
      }
    });
  }

  public onMoveNode (event: any): void {
    const composite = event.node.composite;
    let compositeParent: Composite;
    const targetComposite = event.to.parent.composite;
    const targetIndex = event.to.index;

    for (const c of this._composites) {
      compositeParent = this.getNodeWithCompositeChild(composite, c);
      if (!isNullOrUndefined(compositeParent)) {
        break;
      }
    }

    if (!isNullOrUndefined(compositeParent)) {
      compositeParent.composites.removeWhere(value => value === composite);
    } else {
      this._composites.removeWhere(value => value === composite);
    }

    if (!isNullOrUndefined(targetComposite)) {
      targetComposite.composites.insert(targetIndex, composite);
    } else {
      this._composites.insert(targetIndex, composite);
    }
  }

  public saveAndClose (): void {
    this._dialogRef.close(this._composites);
  }
}
