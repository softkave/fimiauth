import {isArray} from 'lodash-es';
import {DataProviderFilterValueOperator} from '../../contexts/data/DataProvider.js';
import DataProviderFilterBuilder from '../../contexts/data/DataProviderFilterBuilder.js';
import {
  AssignedItem,
  AssignedItemMainFieldsMatcher,
} from '../../definitions/assignedItem.js';
import {FimidaraResourceType} from '../../definitions/system.js';

function newFilter() {
  return new DataProviderFilterBuilder<AssignedItem>();
}

function getByAssignedItem(spaceId: string, assignedItemId: string) {
  const filter = newFilter()
    .addItem(
      'assignedItemId',
      assignedItemId,
      DataProviderFilterValueOperator.Equal
    )
    .addItem('spaceId', spaceId, DataProviderFilterValueOperator.Equal);

  return filter.build();
}

function getByAssignedToResource(
  spaceId: string,
  assigneeId: string | string[],
  assignedItemTypeList?: ReadonlyArray<FimidaraResourceType>
) {
  const filter = newFilter();

  if (isArray(assigneeId)) {
    filter.addItem(
      'assigneeId',
      assigneeId,
      DataProviderFilterValueOperator.In
    );
  } else {
    filter.addItem(
      'assigneeId',
      assigneeId,
      DataProviderFilterValueOperator.Equal
    );
  }

  if (assignedItemTypeList) {
    filter.addItem(
      'assignedItemType',
      assignedItemTypeList,
      DataProviderFilterValueOperator.In
    );
  }

  filter.addItem('spaceId', spaceId, DataProviderFilterValueOperator.Equal);
  return filter.build();
}

function getByMainFields(matcher: AssignedItemMainFieldsMatcher) {
  const filter = newFilter()
    .addItem(
      'assignedItemId',
      matcher.assignedItemId,
      DataProviderFilterValueOperator.Equal
    )
    .addItem(
      'assigneeId',
      matcher.assigneeId,
      DataProviderFilterValueOperator.Equal
    )
    .addItem(
      'workspaceId',
      matcher.workspaceId,
      DataProviderFilterValueOperator.Equal
    );
  return filter.build();
}

export default abstract class AssignedItemQueries {
  static getByAssignedToResource = getByAssignedToResource;
  static getByMainFields = getByMainFields;
  static getByAssignedItem = getByAssignedItem;
}
