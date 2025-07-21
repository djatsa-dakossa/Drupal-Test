<?php

namespace Drupal\category_ajax\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\taxonomy\Entity\Term;

class CategoryAjaxController {

  public function getSubcategories($parent_tid) {
    $children = \Drupal::entityTypeManager()
      ->getStorage('taxonomy_term')
      ->loadTree('categories_d_emploi', $parent_tid, 1, TRUE);

    $response = [];

    foreach ($children as $term) {
      $response[] = [
        'tid' => $term->id(),
        'name' => $term->getName(),
      ];
    }

    return new JsonResponse($response);
  }
}
